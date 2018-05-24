package org.graylog.plugins.collector.rest.resources;

import com.codahale.metrics.annotation.Timed;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog.plugins.collector.services.ActionService;
import org.graylog.plugins.collector.rest.models.CollectorAction;
import org.graylog.plugins.collector.audit.SidecarAuditEventTypes;
import org.graylog.plugins.collector.rest.models.CollectorActions;
import org.graylog.plugins.collector.permissions.SidecarRestPermissions;
import org.graylog2.audit.jersey.AuditEvent;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.hibernate.validator.constraints.NotEmpty;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

@Api(value = "AltCollector Actions", description = "Manage Collector Actions")
@Path("/sidecar/action")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ActionResource extends RestResource implements PluginRestResource {
    private final ActionService actionService;

    @Inject
    public ActionResource(ActionService actionService) {
        this.actionService = actionService;
    }

    @GET
    @Timed
    @Path("/{collectorId}")
    @ApiOperation(value = "Returns queued actions for the specified collector id")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No actions found for specified id")
    })
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.COLLECTORS_READ)
    public List<CollectorAction> getAction(@ApiParam(name = "collectorId", required = true)
                                           @PathParam("collectorId") @NotEmpty String collectorId) {
        final CollectorActions collectorActions = actionService.findActionByCollector(collectorId, false);
        if (collectorActions != null) {
            return collectorActions.action();
        }
        return new ArrayList<>();
    }

    @PUT
    @Timed
    @Path("/{collectorId}")
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.COLLECTORS_UPDATE)
    @ApiOperation(value = "Set a collector action")
    @ApiResponses(value = {@ApiResponse(code = 400, message = "The supplied action is not valid.")})
    @AuditEvent(type = SidecarAuditEventTypes.ACTION_UPDATE)
    public Response setAction(@ApiParam(name = "collectorId", value = "The collector id this collector is registering as.", required = true)
                              @PathParam("collectorId") @NotEmpty String collectorId,
                              @ApiParam(name = "JSON body", required = true)
                              @Valid @NotNull List<CollectorAction> request) {
        final CollectorActions collectorActions = actionService.fromRequest(collectorId, request);
        actionService.saveAction(collectorActions);

        return Response.accepted().build();
    }
}
