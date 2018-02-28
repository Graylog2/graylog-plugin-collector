package org.graylog.plugins.collector.altConfigurations.rest.resources;

import com.codahale.metrics.annotation.Timed;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Function;
import com.google.common.base.Supplier;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog.plugins.collector.altConfigurations.ActionService;
import org.graylog.plugins.collector.altConfigurations.AltCollectorService;
import org.graylog.plugins.collector.altConfigurations.rest.models.Collector;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorAction;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorActions;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorSummary;
import org.graylog.plugins.collector.altConfigurations.rest.models.Collectors;
import org.graylog.plugins.collector.altConfigurations.rest.requests.CollectorRegistrationRequest;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorList;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorRegistrationConfiguration;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorRegistrationResponse;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog.plugins.collector.system.CollectorSystemConfiguration;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.hibernate.validator.constraints.NotEmpty;
import org.joda.time.DateTime;
import org.joda.time.Period;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

@Api(value = "AltCollector", description = "Manage collector fleet")
@Path("/collectors")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AltCollectorResource extends RestResource implements PluginRestResource {
    private final AltCollectorService collectorService;
    private final ActionService actionService;
    private final AltCollectorResource.LostCollectorFunction lostCollectorFunction;
    private final Supplier<CollectorSystemConfiguration> configSupplier;

    @Inject
    public AltCollectorResource(AltCollectorService collectorService,
                                ActionService actionService,
                                Supplier<CollectorSystemConfiguration> configSupplier) {
        this.collectorService = collectorService;
        this.actionService = actionService;
        this.lostCollectorFunction = new AltCollectorResource.LostCollectorFunction(configSupplier.get().collectorInactiveThreshold());
        this.configSupplier = configSupplier;
    }

    @GET
    @Timed
    @ApiOperation(value = "Lists all existing collector registrations")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    public CollectorList list() {
        final List<Collector> collectors = collectorService.all();
        final List<CollectorSummary> collectorSummaries = Collectors.toSummaryList(collectors, lostCollectorFunction);
        return CollectorList.create(collectorSummaries);
    }

    @GET
    @Timed
    @Path("/{collectorId}")
    @ApiOperation(value = "Returns at most one collector summary for the specified collector id")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No collector with the specified id exists")
    })
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    public CollectorSummary get(@ApiParam(name = "collectorId", required = true)
                                @PathParam("collectorId") @NotEmpty String collectorId) {
        final Collector collector = collectorService.findById(collectorId);
        if (collector != null) {
            return collector.toSummary(lostCollectorFunction);
        } else {
            throw new NotFoundException("Collector <" + collectorId + "> not found!");
        }
    }

    @PUT
    @Timed
    @Path("/{collectorId}")
    @ApiOperation(value = "Create/update a collector registration",
            notes = "This is a stateless method which upserts a collector registration")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    @NoAuditEvent("this is only a ping from collectors, and would overflow the audit log")
    public Response register(@ApiParam(name = "collectorId", value = "The collector id this collector is registering as.", required = true)
                             @PathParam("collectorId") @NotEmpty String collectorId,
                             @ApiParam(name = "JSON body", required = true)
                             @Valid @NotNull CollectorRegistrationRequest request,
                             @HeaderParam(value = "X-Graylog-Collector-Version") @NotEmpty String collectorVersion) {
        final Collector collector = collectorService.fromRequest(collectorId, request, collectorVersion);
        collectorService.save(collector);

        final CollectorActions collectorActions = actionService.findActionByCollector(collectorId, true);
        List<CollectorAction> collectorAction = null;
        if (collectorActions != null) {
            collectorAction = collectorActions.getAction();
        }
        final CollectorSystemConfiguration collectorSystemConfiguration = configSupplier.get();
        CollectorRegistrationResponse collectorRegistrationResponse = CollectorRegistrationResponse.create(
                CollectorRegistrationConfiguration.create(
                        collectorSystemConfiguration.collectorUpdateInterval().toStandardDuration().getStandardSeconds(),
                        collectorSystemConfiguration.collectorSendStatus()),
                collectorSystemConfiguration.collectorConfigurationOverride(),
                collectorAction);
        return Response.accepted(collectorRegistrationResponse).build();
    }

    @VisibleForTesting
    protected static class LostCollectorFunction implements Function<Collector, Boolean> {
        private final Period timeoutPeriod;

        @Inject
        public LostCollectorFunction(Period timeoutPeriod) {
            this.timeoutPeriod = timeoutPeriod;
        }

        @Override
        public Boolean apply(Collector collector) {
            final DateTime threshold = DateTime.now().minus(timeoutPeriod);
            return collector.lastSeen().isAfter(threshold);
        }
    }
}
