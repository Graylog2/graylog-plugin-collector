package org.graylog.plugins.collector.altConfigurations.rest.resources;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog.plugins.collector.altConfigurations.BackendService;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorBackend;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorBackendSummary;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorBackendListResponse;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorBackendSummaryResponse;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;

@Api(value = "Backends", description = "Manage collector backends")
@Path("/altconfiguration/backends")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class BackendResource extends RestResource implements PluginRestResource {
    private final BackendService backendService;

    @Inject
    public BackendResource(BackendService backendService) {
        this.backendService = backendService;
    }

    @GET
//    @RequiresAuthentication
//    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List all collector backends")
    public CollectorBackendListResponse listBackends() {
        final List<CollectorBackend> result = this.backendService.loadAll();
        return CollectorBackendListResponse.create(result.size(), result);

    }

    @GET
    @Path("/summary")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List a summary of all collector backends")
    public CollectorBackendSummaryResponse listSummary() {
        final List<CollectorBackendSummary> result = this.backendService.loadAll().stream()
                .map(this::getCollectorBackendSummary)
                .collect(Collectors.toList());

        return CollectorBackendSummaryResponse.create(result.size(), result);

    }

    @POST
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create new collector backend")
    public CollectorBackend createConfiguration(@ApiParam(name = "JSON body", required = true)
                                                @Valid @NotNull CollectorBackend request) {
        CollectorBackend collectorBackend = backendService.fromRequest(request);
        return backendService.save(collectorBackend);
    }

    private CollectorBackendSummary getCollectorBackendSummary(CollectorBackend backend) {
        return CollectorBackendSummary.create(
                backend.id(),
                backend.name(),
                backend.serviceType(),
                backend.nodeOperatingSystem());
    }

}
