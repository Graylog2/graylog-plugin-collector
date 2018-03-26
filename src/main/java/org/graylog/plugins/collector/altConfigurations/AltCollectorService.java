package org.graylog.plugins.collector.altConfigurations;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.mongodb.BasicDBObject;
import org.bson.types.ObjectId;
import org.graylog.plugins.collector.altConfigurations.rest.models.Collector;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorConfigurationRelation;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorNodeDetails;
import org.graylog.plugins.collector.altConfigurations.rest.requests.CollectorRegistrationRequest;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorSummary;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.graylog2.database.NotFoundException;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Period;
import org.mongojack.DBCursor;
import org.mongojack.DBQuery;
import org.mongojack.JacksonDBCollection;

import javax.inject.Inject;
import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.util.List;
import java.util.Set;

public class AltCollectorService {
    private static final String COLLECTION_NAME = "collectors";
    private final JacksonDBCollection<Collector, ObjectId> dbCollection;
    private final BackendService backendService;
    private final AltConfigurationService configurationService;

    private final Validator validator;

    @Inject
    public AltCollectorService(BackendService backendService,
                               AltConfigurationService configurationService,
                               MongoConnection mongoConnection,
                               MongoJackObjectMapperProvider mapper,
                               Validator validator) {
        this.backendService = backendService;
        this.configurationService = configurationService;
        this.validator = validator;
        dbCollection = JacksonDBCollection.wrap(
                mongoConnection.getDatabase().getCollection(COLLECTION_NAME),
                Collector.class,
                ObjectId.class,
                mapper.get());

        this.dbCollection.createIndex(new BasicDBObject("node_id", 1), new BasicDBObject("unique", true));
    }

    public long count() {
        return dbCollection.count();
    }

    public Collector save(Collector collector) {
        if (collector != null) {
            final Set<ConstraintViolation<Collector>> violations = validator.validate(collector);
            if (violations.isEmpty()) {
                return dbCollection.findAndModify(
                        DBQuery.is("node_id", collector.nodeId()),
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
        return toAbstractListType(dbCollection.find());
    }

    public Collector findByNodeId(String id) {
        return dbCollection.findOne(DBQuery.is("node_id", id));
    }

    public int destroy(Collector collector) {
        return dbCollection.remove(DBQuery.is("id", collector.id())).getN();
    }

    public int destroyExpired(Period period) {
        int count = 0;
        final DateTime threshold = DateTime.now(DateTimeZone.UTC).minus(period);
        for (Collector collector : all())
            if (collector.lastSeen().isBefore(threshold))
                count += destroy(collector);

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

    public Collector assignConfiguration(String collectorNodeId, String backendId, String configurationId) throws NotFoundException{
        Collector collector = findByNodeId(collectorNodeId);
        if (collector == null) {
            throw new NotFoundException("Couldn't find collector with ID " + collectorNodeId);
        }
        if (backendService.load(backendId) == null) {
            throw new NotFoundException("Couldn't find backend with ID " + backendId);
        }
        if (configurationService.load(configurationId) == null) {
            throw new NotFoundException("Couldn't find configuration with ID " + configurationId);
        }

        List<CollectorConfigurationRelation> assignments = collector.assignments();
        if (assignments != null) {
            for (int i = 0; i < assignments.size(); i++) {
                CollectorConfigurationRelation relation = assignments.get(i);
                if (relation.backendId().equalsIgnoreCase(backendId)) {
                    assignments.set(i, CollectorConfigurationRelation.create(backendId, configurationId));
                }
            }
        } else {
            assignments = Lists.newArrayList();
            assignments.add(CollectorConfigurationRelation.create(backendId, configurationId));
        }
        Collector toSave = collector.toBuilder()
                .assignments(assignments)
                .build();
        return save(toSave);
    }

    public List<CollectorSummary> toSummaryList(List<Collector> collectors, Function<Collector, Boolean> isActiveFunction) {
        final List<CollectorSummary> collectorSummaries = Lists.newArrayListWithCapacity(collectors.size());
        for (Collector collector : collectors)
            collectorSummaries.add(collector.toSummary(isActiveFunction));

        return collectorSummaries;
    }

    private List<Collector> toAbstractListType(DBCursor<Collector> collectors) {
        return toAbstractListType(collectors.toArray());
    }
    private List<Collector> toAbstractListType(List<Collector> collectors) {
        final List<Collector> result = Lists.newArrayListWithCapacity(collectors.size());
        result.addAll(collectors);

        return result;
    }

}
