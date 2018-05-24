package org.graylog.plugins.collector.services;

import org.graylog.plugins.collector.rest.models.Backend;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.graylog2.database.PaginatedDbService;
import org.graylog2.database.PaginatedList;
import org.graylog2.search.SearchQuery;
import org.mongojack.DBQuery;
import org.mongojack.DBSort;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Singleton
public class BackendService extends PaginatedDbService<Backend> {
    private static final String COLLECTION_NAME = "collector_backends";

    @Inject
    public BackendService(MongoConnection mongoConnection,
                          MongoJackObjectMapperProvider mapper) {
        super(mongoConnection, mapper, Backend.class, COLLECTION_NAME);
    }

    public Backend find(String id) {
        return db.findOne(DBQuery.is("_id", id));
    }

    public Backend findByName(String name) {
        return db.findOne(DBQuery.is("name", name));
    }

    public List<Backend> allFilter(Predicate<Backend> filter) {
        try (final Stream<Backend> backendsStream = streamAll()) {
            final Stream<Backend> filteredStream = filter == null ? backendsStream : backendsStream.filter(filter);
            return filteredStream.collect(Collectors.toList());
        }
    }

    public List<Backend> all() {
        return allFilter(null);
    }

    public PaginatedList<Backend> findPaginated(SearchQuery searchQuery, int page, int perPage, String sortField, String order) {
        final DBQuery.Query dbQuery = searchQuery.toDBQuery();
        final DBSort.SortBuilder sortBuilder = getSortBuilder(order, sortField);
        return findPaginatedWithQueryAndSort(dbQuery, sortBuilder, page, perPage);
    }

    public Backend fromRequest(Backend request) {
        return Backend.create(
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

    public Backend fromRequest(String id, Backend request) {
        final Backend backend = fromRequest(request);
        return backend.toBuilder()
                .id(id)
                .build();
    }

    public Backend copy(String id, String name) {
        Backend backend = find(id);
        return backend.toBuilder()
                .id(null)
                .name(name)
                .build();
    }
}
