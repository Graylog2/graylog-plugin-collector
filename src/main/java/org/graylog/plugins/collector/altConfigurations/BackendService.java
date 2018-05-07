package org.graylog.plugins.collector.altConfigurations;

import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorBackend;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.graylog2.database.PaginatedDbService;
import org.mongojack.DBQuery;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.List;
import java.util.function.Predicate;
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

    public CollectorBackend find(String id) {
        return db.findOne(DBQuery.is("_id", id));
    }

    public CollectorBackend findByName(String name) {
        return db.findOne(DBQuery.is("name", name));
    }

    public List<CollectorBackend> allFilter(Predicate<CollectorBackend> filter) {
        try (final Stream<CollectorBackend> backendsStream = streamAll()) {
            final Stream<CollectorBackend> filteredStream = filter == null ? backendsStream : backendsStream.filter(filter);
            return filteredStream.collect(Collectors.toList());
        }
    }

    public List<CollectorBackend> all() {
        return allFilter(null);
    }

    public CollectorBackend fromRequest(CollectorBackend request) {
        return CollectorBackend.create(
                null,
                request.name(),
                request.serviceType(),
                request.nodeOperatingSystem(),
                request.executablePath(),
                request.configurationPath(),
                request.executeParameters(),
                request.validationCommand(),
                request.defaultTemplate());
    }

    public CollectorBackend fromRequest(String id, CollectorBackend request) {
        final CollectorBackend collectorBackend = fromRequest(request);
        return collectorBackend.toBuilder()
                .id(id)
                .build();
    }

    public CollectorBackend copy(String id, String name) {
        CollectorBackend collectorBackend = find(id);
        return collectorBackend.toBuilder()
                .id(null)
                .name(name)
                .build();
    }
}
