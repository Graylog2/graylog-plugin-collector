package org.graylog.plugins.collector.rest.resources;

import com.codahale.metrics.annotation.Timed;
import com.google.common.base.Supplier;
import com.google.common.collect.ImmutableList;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog.plugins.collector.filter.AdministrationFiltersFactory;
import org.graylog.plugins.collector.services.CollectorService;
import org.graylog.plugins.collector.services.ConfigurationService;
import org.graylog.plugins.collector.services.BackendService;
import org.graylog.plugins.collector.filter.ActiveCollectorFilter;
import org.graylog.plugins.collector.filter.AdministrationFilter;
import org.graylog.plugins.collector.rest.models.Collector;
import org.graylog.plugins.collector.rest.models.CollectorBackend;
import org.graylog.plugins.collector.rest.models.CollectorConfiguration;
import org.graylog.plugins.collector.rest.requests.CollectorAdministrationRequest;
import org.graylog.plugins.collector.rest.responses.CollectorListResponse;
import org.graylog.plugins.collector.rest.models.CollectorSummary;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog.plugins.collector.system.CollectorSystemConfiguration;
import org.graylog2.database.PaginatedList;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.search.SearchQuery;
import org.graylog2.search.SearchQueryParser;
import org.graylog2.shared.rest.resources.RestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Api(value = "AltCollector", description = "Manage collector fleet")
@Path("/sidecar/administration")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AdministrationResource extends RestResource implements PluginRestResource {
    private final CollectorService collectorService;
    private final ConfigurationService configurationService;
    private final BackendService backendService;
    private final SearchQueryParser searchQueryParser;
    private final AdministrationFiltersFactory administrationFiltersFactory;
    private final ActiveCollectorFilter activeCollectorFilter;

    @Inject
    public AdministrationResource(CollectorService collectorService,
                                  ConfigurationService configurationService,
                                  BackendService backendService,
                                  AdministrationFiltersFactory administrationFiltersFactory,
                                  Supplier<CollectorSystemConfiguration> configSupplier) {
        this.collectorService = collectorService;
        this.configurationService = configurationService;
        this.backendService = backendService;
        this.administrationFiltersFactory = administrationFiltersFactory;
        this.activeCollectorFilter = new ActiveCollectorFilter(configSupplier.get().collectorInactiveThreshold());
        this.searchQueryParser = new SearchQueryParser(Collector.FIELD_NODE_NAME, CollectorResource.SEARCH_FIELD_MAPPING);
    }

    @POST
    @Timed
    @ApiOperation(value = "Lists existing collector registrations including compatible backends using pagination")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.SIDECARS_READ)
    public CollectorListResponse administration(@ApiParam(name = "JSON body", required = true)
                                                @Valid @NotNull CollectorAdministrationRequest request) {
        final String sort = Collector.FIELD_NODE_NAME;
        final String order = "asc";
        final SearchQuery searchQuery = searchQueryParser.parse(request.query());

        final Optional<Predicate<Collector>> filters = administrationFiltersFactory.getFilters(request.filters());

        final List<CollectorBackend> backends = getCollectorBackends(request.filters());
        final PaginatedList<Collector> collectors = collectorService.findPaginated(searchQuery, filters.orElse(null), request.page(), request.perPage(), sort, order);
        final List<CollectorSummary> collectorSummaries = collectorService.toSummaryList(collectors, activeCollectorFilter);

        final List<CollectorSummary> summariesWithBackends = collectorSummaries.stream()
                .map(collector -> {
                    final List<String> compatibleBackends = backends.stream()
                            .filter(backend -> backend.nodeOperatingSystem().equalsIgnoreCase(collector.nodeDetails().operatingSystem()))
                            .map(CollectorBackend::id)
                            .collect(Collectors.toList());
                    return collector.toBuilder()
                            .backends(compatibleBackends)
                            .build();
                })
                .filter(collectorSummary -> !filters.isPresent() || collectorSummary.backends().size() > 0)
                .collect(Collectors.toList());

        return CollectorListResponse.create(request.query(), collectors.pagination(), false, sort, order, summariesWithBackends, request.filters());
    }

    private List<CollectorBackend> getCollectorBackends(Map<String, String> filters) {
        final String backendKey = AdministrationFilter.Type.BACKEND.toString().toLowerCase();
        final String configurationKey = AdministrationFilter.Type.CONFIGURATION.toString().toLowerCase();

        final List<String> backendIds = new ArrayList<>();

        if (filters.containsKey(backendKey)) {
            backendIds.add(filters.get(backendKey));
        }
        if (filters.containsKey(configurationKey)) {
            final CollectorConfiguration configuration = configurationService.find(filters.get(configurationKey));
            if (!backendIds.contains(configuration.backendId())) {
                backendIds.add(configuration.backendId());
            }
        }

        switch (backendIds.size()) {
            case 0:
                return backendService.all();
            case 1:
                return ImmutableList.of(backendService.find(backendIds.get(0)));
            default:
                return new ArrayList<>();
        }
    }
}