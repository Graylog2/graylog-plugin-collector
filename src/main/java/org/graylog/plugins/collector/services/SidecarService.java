package org.graylog.plugins.collector.services;

import com.mongodb.BasicDBObject;
import org.graylog.plugins.collector.rest.models.Sidecar;
import org.graylog.plugins.collector.rest.models.Backend;
import org.graylog.plugins.collector.rest.models.Configuration;
import org.graylog.plugins.collector.rest.models.NodeDetails;
import org.graylog.plugins.collector.rest.requests.RegistrationRequest;
import org.graylog.plugins.collector.rest.requests.ConfigurationAssignment;
import org.graylog.plugins.collector.rest.models.SidecarSummary;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.graylog2.database.NotFoundException;
import org.graylog2.database.PaginatedDbService;
import org.graylog2.database.PaginatedList;
import org.graylog2.search.SearchQuery;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Period;
import org.mongojack.DBQuery;
import org.mongojack.DBSort;

import javax.inject.Inject;
import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class SidecarService extends PaginatedDbService<Sidecar> {
    private static final String COLLECTION_NAME = "collectors";
    private final BackendService backendService;
    private final ConfigurationService configurationService;

    private final Validator validator;

    @Inject
    public SidecarService(BackendService backendService,
                          ConfigurationService configurationService,
                          MongoConnection mongoConnection,
                          MongoJackObjectMapperProvider mapper,
                          Validator validator) {
        super(mongoConnection, mapper, Sidecar.class, COLLECTION_NAME);
        this.backendService = backendService;
        this.configurationService = configurationService;
        this.validator = validator;

        db.createIndex(new BasicDBObject(Sidecar.FIELD_NODE_ID, 1), new BasicDBObject("unique", true));
    }

    public long count() {
        return db.count();
    }

    @Override
    public Sidecar save(Sidecar sidecar) {
        if (sidecar != null) {
            final Set<ConstraintViolation<Sidecar>> violations = validator.validate(sidecar);
            if (violations.isEmpty()) {
                return db.findAndModify(
                        DBQuery.is(Sidecar.FIELD_NODE_ID, sidecar.nodeId()),
                        new BasicDBObject(),
                        new BasicDBObject(),
                        false,
                        sidecar,
                        true,
                        true);
            } else {
                throw new IllegalArgumentException("Specified object failed validation: " + violations);
            }
        } else
            throw new IllegalArgumentException("Specified object is not of correct implementation type (" + sidecar.getClass() + ")!");
    }

    public List<Sidecar> all() {
        try (final Stream<Sidecar> collectorStream = streamAll()) {
            return collectorStream.collect(Collectors.toList());
        }
    }

    public Sidecar findByNodeId(String id) {
        return db.findOne(DBQuery.is(Sidecar.FIELD_NODE_ID, id));
    }

    public PaginatedList<Sidecar> findPaginated(SearchQuery searchQuery, int page, int perPage, String sortField, String order) {
        final DBQuery.Query dbQuery = searchQuery.toDBQuery();
        final DBSort.SortBuilder sortBuilder = getSortBuilder(order, sortField);
        return findPaginatedWithQueryAndSort(dbQuery, sortBuilder, page, perPage);
    }

    public PaginatedList<Sidecar> findPaginated(SearchQuery searchQuery, Predicate<Sidecar> filter, int page, int perPage, String sortField, String order) {
        final DBQuery.Query dbQuery = searchQuery.toDBQuery();
        final DBSort.SortBuilder sortBuilder = getSortBuilder(order, sortField);
        if (filter == null) {
            return findPaginatedWithQueryAndSort(dbQuery, sortBuilder, page, perPage);
        }
        return findPaginatedWithQueryFilterAndSort(dbQuery, filter, sortBuilder, page, perPage);
    }

    public int destroyExpired(Period period) {
        final DateTime threshold = DateTime.now(DateTimeZone.UTC).minus(period);
        int count;

        try (final Stream<Sidecar> collectorStream = streamAll()) {
            count = collectorStream
                    .mapToInt(collector -> {
                        if (collector.lastSeen().isBefore(threshold)) {
                            return delete(collector.id());
                        }
                        return 0;
                    })
                    .sum();
        }

        return count;
    }

    public Sidecar fromRequest(String nodeId, RegistrationRequest request, String collectorVersion) {
        return Sidecar.create(
                nodeId,
                request.nodeName(),
                NodeDetails.create(
                        request.nodeDetails().operatingSystem(),
                        request.nodeDetails().ip(),
                        request.nodeDetails().metrics(),
                        request.nodeDetails().logFileList(),
                        request.nodeDetails().statusList()),
                collectorVersion);
    }

    public Sidecar assignConfiguration(String collectorNodeId, List<ConfigurationAssignment> assignments) throws NotFoundException{
        Sidecar sidecar = findByNodeId(collectorNodeId);
        if (sidecar == null) {
            throw new NotFoundException("Couldn't find collector with ID " + collectorNodeId);
        }
        for (ConfigurationAssignment assignment : assignments) {
            Backend backend = backendService.find(assignment.backendId());
            if (backend == null) {
                throw new NotFoundException("Couldn't find backend with ID " + assignment.backendId());
            }
            Configuration configuration = configurationService.find(assignment.configurationId());
            if (configuration == null) {
                throw new NotFoundException("Couldn't find configuration with ID " + assignment.configurationId());
            }
            if (!configuration.backendId().equals(backend.id())) {
                throw new NotFoundException("Configuration doesn't match backend ID " + assignment.backendId());
            }
        }

        Sidecar toSave = sidecar.toBuilder()
                .assignments(assignments)
                .build();
        return save(toSave);
    }

    public List<SidecarSummary> toSummaryList(List<Sidecar> sidecars, Predicate<Sidecar> isActiveFunction) {
        return sidecars.stream()
                .map(collector -> collector.toSummary(isActiveFunction))
                .collect(Collectors.toList());
    }
}
