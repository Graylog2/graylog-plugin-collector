/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog.plugins.collector.collectors.rest;

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
import org.graylog.plugins.collector.audit.CollectorAuditEventTypes;
import org.graylog.plugins.collector.collectors.Collector;
import org.graylog.plugins.collector.collectors.CollectorActions;
import org.graylog.plugins.collector.collectors.CollectorService;
import org.graylog.plugins.collector.collectors.CollectorUpload;
import org.graylog.plugins.collector.collectors.Collectors;
import org.graylog.plugins.collector.collectors.rest.models.CollectorAction;
import org.graylog.plugins.collector.collectors.rest.models.requests.CollectorRegistrationRequest;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorList;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorRegistrationConfiguration;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorRegistrationResponse;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorSummary;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog.plugins.collector.system.CollectorSystemConfiguration;
import org.graylog2.audit.jersey.AuditEvent;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.hibernate.validator.constraints.NotEmpty;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
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
import java.util.ArrayList;
import java.util.List;

@Api(value = "System/Collectors", description = "Management of Graylog Collectors.")
@Path("/collectors")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CollectorResource extends RestResource implements PluginRestResource {
    private final CollectorService collectorService;
    private final LostCollectorFunction lostCollectorFunction;
    private final Supplier<CollectorSystemConfiguration> configSupplier;

    @Inject
    public CollectorResource(CollectorService collectorService, Supplier<CollectorSystemConfiguration> configSupplier) {
        this.collectorService = collectorService;
        this.lostCollectorFunction = new LostCollectorFunction(configSupplier.get().collectorInactiveThreshold());
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

    @GET
    @Timed
    @Path("/{collectorId}/action")
    @ApiOperation(value = "Returns queued actions for the specified collector id")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No actions found for specified id")
    })
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    public List<CollectorAction> getAction(@ApiParam(name = "collectorId", required = true)
                                      @PathParam("collectorId") @NotEmpty String collectorId) {
        final CollectorActions collectorActions = collectorService.findActionByCollector(collectorId, false);
        if (collectorActions != null) {
            return collectorActions.getAction();
        }
        return new ArrayList<>();
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
        final Collector collector = collectorService.fromRequest(collectorId,request, collectorVersion);
        collectorService.save(collector);

        final CollectorActions collectorActions = collectorService.findActionByCollector(collectorId, true);
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

    @PUT
    @Timed
    @Path("/{collectorId}/configuration")
    @ApiOperation(value = "Pass back rendered collector configuratin",
            notes = "This method uploads a collector configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    @NoAuditEvent("Sidecar back channel for configuration uploads")
    public Response upload(@ApiParam(name = "collectorId", value = "The collector id this collector is registering as.", required = true)
                           @PathParam("collectorId") @NotEmpty String collectorId,
                           @ApiParam(name = "JSON body", required = true)
                           @Valid @NotNull CollectorUpload request,
                           @HeaderParam(value = "X-Graylog-Collector-Version") @NotEmpty String collectorVersion) {
        CollectorUpload upload = request.toBuilder().created(DateTime.now(DateTimeZone.UTC)).build();
        collectorService.saveUpload(upload);

        return Response.accepted().build();
    }

    @PUT
    @Timed
    @Path("/{collectorId}/action")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_UPDATE)
    @ApiOperation(value = "Set a collector action")
    @ApiResponses(value = {@ApiResponse(code = 400, message = "The supplied action is not valid.")})
    @AuditEvent(type = CollectorAuditEventTypes.ACTION_UPDATE)
    public Response setAction(@ApiParam(name = "collectorId", value = "The collector id this collector is registering as.", required = true)
                           @PathParam("collectorId") @NotEmpty String collectorId,
                           @ApiParam(name = "JSON body", required = true)
                           @Valid @NotNull List<CollectorAction> request) {
        final CollectorActions collectorActions = collectorService.actionFromRequest(collectorId, request);
        collectorService.saveAction(collectorActions);

        return Response.accepted().build();
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
            return collector.getLastSeen().isAfter(threshold);
        }
    }
}
