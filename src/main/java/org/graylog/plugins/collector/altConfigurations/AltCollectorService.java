package org.graylog.plugins.collector.altConfigurations;

import com.mongodb.BasicDBObject;
import org.graylog.plugins.collector.altConfigurations.rest.models.Collector;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorBackend;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorConfiguration;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorNodeDetails;
import org.graylog.plugins.collector.altConfigurations.rest.requests.CollectorRegistrationRequest;
import org.graylog.plugins.collector.altConfigurations.rest.requests.ConfigurationAssignment;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorSummary;
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

import static com.google.common.base.MoreObjects.firstNonNull;

public class AltCollectorService extends PaginatedDbService<Collector> {
    private static final String COLLECTION_NAME = "collectors";
    private final BackendService backendService;
    private final AltConfigurationService configurationService;

    private final Validator validator;

    @Inject
    public AltCollectorService(BackendService backendService,
                               AltConfigurationService configurationService,
                               MongoConnection mongoConnection,
                               MongoJackObjectMapperProvider mapper,
                               Validator validator) {
        super(mongoConnection, mapper, Collector.class, COLLECTION_NAME);
        this.backendService = backendService;
        this.configurationService = configurationService;
        this.validator = validator;

        db.createIndex(new BasicDBObject(Collector.FIELD_NODE_ID, 1), new BasicDBObject("unique", true));
    }

    public long count() {
        return db.count();
    }

    @Override
    public Collector save(Collector collector) {
        if (collector != null) {
            final Set<ConstraintViolation<Collector>> violations = validator.validate(collector);
            if (violations.isEmpty()) {
                return db.findAndModify(
                        DBQuery.is(Collector.FIELD_NODE_ID, collector.nodeId()),
                        new BasicDBObject(),
                        new BasicDBObject(),
                        false,
                        collector,
                        true,
                        true);
            } else {
                throw new IllegalArgumentException("Specified object failed validation: " + violations);
            }
        } else
            throw new IllegalArgumentException("Specified object is not of correct implementation type (" + collector.getClass() + ")!");
    }

    public List<Collector> all() {
        try (final Stream<Collector> collectorStream = streamAll()) {
            return collectorStream.collect(Collectors.toList());
        }
    }

    public Collector findByNodeId(String id) {
        return db.findOne(DBQuery.is(Collector.FIELD_NODE_ID, id));
    }

    public PaginatedList<Collector> findPaginated(SearchQuery searchQuery, int page, int perPage) {
        final DBQuery.Query dbQuery = searchQuery.toDBQuery();
        return findPaginatedWithQueryAndSort(dbQuery, DBSort.asc(Collector.FIELD_NODE_NAME), page, perPage);
    }

    public PaginatedList<Collector> findPaginated(SearchQuery searchQuery, Predicate<Collector> isActiveFunction, int page, int perPage) {
        final DBQuery.Query dbQuery = searchQuery.toDBQuery();
        return findPaginatedWithQueryFilterAndSort(dbQuery, firstNonNull(isActiveFunction, collector -> true), DBSort.asc(Collector.FIELD_NODE_NAME), page, perPage);
    }

    public int destroyExpired(Period period) {
        final DateTime threshold = DateTime.now(DateTimeZone.UTC).minus(period);
        int count;

        try (final Stream<Collector> collectorStream = streamAll()) {
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

    public Collector fromRequest(String nodeId, CollectorRegistrationRequest request, String collectorVersion) {
        return Collector.create(
                nodeId,
                request.nodeName(),
                CollectorNodeDetails.create(
                        request.nodeDetails().operatingSystem(),
                        request.nodeDetails().ip(),
                        request.nodeDetails().metrics(),
                        request.nodeDetails().logFileList(),
                        request.nodeDetails().statusList()),
                collectorVersion);
    }

    public Collector assignConfiguration(String collectorNodeId, List<ConfigurationAssignment> assignments) throws NotFoundException{
        Collector collector = findByNodeId(collectorNodeId);
        if (collector == null) {
            throw new NotFoundException("Couldn't find collector with ID " + collectorNodeId);
        }
        for (ConfigurationAssignment assignment : assignments) {
            CollectorBackend backend = backendService.load(assignment.backendId());
            if (backend == null) {
                throw new NotFoundException("Couldn't find backend with ID " + assignment.backendId());
            }
            CollectorConfiguration configuration = configurationService.load(assignment.configurationId());
            if (configuration == null) {
                throw new NotFoundException("Couldn't find configuration with ID " + assignment.configurationId());
            }
            if (!configuration.backendId().equals(backend.id())) {
                throw new NotFoundException("Configuration doesn't match backend ID " + assignment.backendId());
            }
        }

        Collector toSave = collector.toBuilder()
                .assignments(assignments)
                .build();
        return save(toSave);
    }

    public List<CollectorSummary> toSummaryList(List<Collector> collectors, Predicate<Collector> isActiveFunction) {
        return collectors.stream()
                .map(collector -> collector.toSummary(isActiveFunction))
                .collect(Collectors.toList());
    }
}
