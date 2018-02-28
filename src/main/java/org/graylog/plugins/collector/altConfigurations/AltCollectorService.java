package org.graylog.plugins.collector.altConfigurations;

import com.google.common.collect.Lists;
import com.mongodb.BasicDBObject;
import org.bson.types.ObjectId;
import org.graylog.plugins.collector.altConfigurations.rest.models.Collector;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorNodeDetails;
import org.graylog.plugins.collector.altConfigurations.rest.requests.CollectorRegistrationRequest;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
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

    private final Validator validator;

    @Inject
    public AltCollectorService(MongoConnection mongoConnection,
                               MongoJackObjectMapperProvider mapper,
                               Validator validator) {
        this.validator = validator;
        dbCollection = JacksonDBCollection.wrap(
                mongoConnection.getDatabase().getCollection(COLLECTION_NAME),
                Collector.class,
                ObjectId.class,
                mapper.get());

        this.dbCollection.createIndex(new BasicDBObject("id", 1), new BasicDBObject("unique", true));
    }

    public long count() {
        return dbCollection.count();
    }

    public Collector save(Collector collector) {
        if (collector != null) {
            final Set<ConstraintViolation<Collector>> violations = validator.validate(collector);
            if (violations.isEmpty()) {
                return dbCollection.findAndModify(
                        DBQuery.is("id", collector.id()),
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

    public Collector findById(String id) {
        return dbCollection.findOne(DBQuery.is("id", id));
    }

    public List<Collector> findByNodeId(String nodeId) {
        return toAbstractListType(dbCollection.find(DBQuery.is("node_id", nodeId)));
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

    public Collector fromRequest(String collectorId, CollectorRegistrationRequest request, String collectorVersion) {
        return Collector.create(
                collectorId,
                request.nodeId(),
                collectorVersion,
                CollectorNodeDetails.create(
                        request.nodeDetails().operatingSystem(),
                        request.nodeDetails().tags(),
                        request.nodeDetails().ip(),
                        request.nodeDetails().metrics(),
                        request.nodeDetails().logFileList(),
                        request.nodeDetails().statusList()),
                DateTime.now(DateTimeZone.UTC));
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
