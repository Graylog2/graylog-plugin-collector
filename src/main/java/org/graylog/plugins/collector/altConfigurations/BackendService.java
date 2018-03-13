package org.graylog.plugins.collector.altConfigurations;

import com.google.common.collect.Lists;
import org.bson.types.ObjectId;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorBackend;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.mongojack.DBCursor;
import org.mongojack.DBQuery;
import org.mongojack.JacksonDBCollection;
import org.mongojack.WriteResult;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.List;

@Singleton
public class BackendService {
    private static final String COLLECTION_NAME = "collector_backends";
    private final JacksonDBCollection<CollectorBackend, ObjectId> dbCollection;

    @Inject
    public BackendService(MongoConnection mongoConnection,
                          MongoJackObjectMapperProvider mapper) {
        dbCollection = JacksonDBCollection.wrap(
                mongoConnection.getDatabase().getCollection(COLLECTION_NAME),
                CollectorBackend.class,
                ObjectId.class,
                mapper.get());
    }

    public CollectorBackend load(String id) {
        return dbCollection.findOne(DBQuery.is("_id", id));
    }

    public CollectorBackend loadForName(String name) {
        return dbCollection.findOne(DBQuery.is("name", name));
    }

    public List<CollectorBackend> loadAll() {
        return toAbstractListType(dbCollection.find());
    }

    public CollectorBackend fromRequest(CollectorBackend request) {
        CollectorBackend collectorBackend = CollectorBackend.create(
                request.name(),
                request.serviceType(),
                request.nodeOperatingSystem(),
                request.executablePath(),
                request.configurationPath(),
                request.executeParameters(),
                request.validationCommand());
        return collectorBackend;
    }

    public CollectorBackend save(CollectorBackend backend) {
        final WriteResult<CollectorBackend, ObjectId> result = dbCollection.save(backend);
        return result.getSavedObject();
    }

    public int delete(String id) {
        return dbCollection.remove(DBQuery.is("_id", id)).getN();
    }

    private List<CollectorBackend> toAbstractListType(DBCursor<CollectorBackend> backends) {
        return toAbstractListType(backends.toArray());
    }

    private List<CollectorBackend> toAbstractListType(List<CollectorBackend> backends) {
        final List<CollectorBackend> result = Lists.newArrayListWithCapacity(backends.size());
        result.addAll(backends);

        return result;
    }
}
