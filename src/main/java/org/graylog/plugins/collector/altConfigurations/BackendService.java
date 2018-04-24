package org.graylog.plugins.collector.altConfigurations;

import com.google.common.collect.Lists;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorBackend;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.graylog2.database.PaginatedDbService;
import org.mongojack.DBQuery;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Singleton
public class BackendService extends PaginatedDbService<CollectorBackend> {
    private static final String COLLECTION_NAME = "collector_backends";

    @Inject
    public BackendService(MongoConnection mongoConnection,
                          MongoJackObjectMapperProvider mapper) {
        super(mongoConnection, mapper, CollectorBackend.class, COLLECTION_NAME);
    }

    public CollectorBackend load(String id) {
        return db.findOne(DBQuery.is("_id", id));
    }

    public CollectorBackend loadForName(String name) {
        return db.findOne(DBQuery.is("name", name));
    }

    public List<CollectorBackend> loadAll() {
        try (final Stream<CollectorBackend> backendsStream = streamAll()) {
            return toAbstractListType(backendsStream.collect(Collectors.toList()));
        }
    }

    public CollectorBackend fromRequest(CollectorBackend request) {
        CollectorBackend collectorBackend = CollectorBackend.create(
                request.name(),
                request.serviceType(),
                request.nodeOperatingSystem(),
                request.executablePath(),
                request.configurationPath(),
                request.executeParameters(),
                request.validationCommand(),
                request.defaultTemplate());
        return collectorBackend;
    }

    public CollectorBackend fromRequest(String id, CollectorBackend request) {
        CollectorBackend collectorBackend = CollectorBackend.create(
                id,
                request.name(),
                request.serviceType(),
                request.nodeOperatingSystem(),
                request.executablePath(),
                request.configurationPath(),
                request.executeParameters(),
                request.validationCommand(),
                request.defaultTemplate());
        return collectorBackend;
    }

    public CollectorBackend copy(String id, String name) {
        CollectorBackend collectorBackend = load(id);
        return CollectorBackend.create(
                name,
                collectorBackend.serviceType(),
                collectorBackend.nodeOperatingSystem(),
                collectorBackend.executablePath(),
                collectorBackend.configurationPath(),
                collectorBackend.executeParameters(),
                collectorBackend.validationCommand(),
                collectorBackend.defaultTemplate()
        );
    }

    private List<CollectorBackend> toAbstractListType(List<CollectorBackend> backends) {
        final List<CollectorBackend> result = Lists.newArrayListWithCapacity(backends.size());
        result.addAll(backends);

        return result;
    }
}
