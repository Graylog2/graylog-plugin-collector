package org.graylog.plugins.collector.altConfigurations.rest.resources;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog.plugins.collector.altConfigurations.AltCollectorService;
import org.graylog.plugins.collector.altConfigurations.AltConfigurationService;
import org.graylog.plugins.collector.altConfigurations.rest.models.Collector;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorConfiguration;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorConfigurationSummary;
import org.graylog.plugins.collector.altConfigurations.rest.responses.ConfigurationPreviewRenderResponse;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorConfigurationListResponse;
import org.graylog.plugins.collector.audit.CollectorAuditEventTypes;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog2.audit.jersey.AuditEvent;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;

@Api(value = "AltConfiguration", description = "Render collector configurations")
@Path("/altconfiguration")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AltConfigurationResource extends RestResource implements PluginRestResource {
    private final AltConfigurationService configurationService;
    private final AltCollectorService collectorService;

    @Inject
    public AltConfigurationResource(AltConfigurationService configurationService,
                                    AltCollectorService collectorService) {
        this.configurationService = configurationService;
        this.collectorService = collectorService;
    }

    @GET
    @Path("/configurations")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List all collector configurations")
    public CollectorConfigurationListResponse listConfigurations() {
        final List<CollectorConfigurationSummary> result = this.configurationService.loadAll().stream()
                .map(this::getCollectorConfigurationSummary)
                .collect(Collectors.toList());

        return CollectorConfigurationListResponse.create(result.size(), result);
    }

    @GET
    @Path("/configurations/{id}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Show collector configuration details")
    public CollectorConfiguration getConfigurations(@ApiParam(name = "id", required = true)
                                                    @PathParam("id") String id) {
        return this.configurationService.load(id);
    }

    @GET
    @Path("/render/{collectorId}/{configurationId}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Render collector configuration template")
    public CollectorConfiguration renderConfiguration(@ApiParam(name = "collectorId", required = true)
                                                      @PathParam("collectorId") String collectorId,
                                                      @ApiParam(name = "configurationId", required = true)
                                                      @PathParam("configurationId") String configurationId) {
        Collector collector = collectorService.findByNodeId(collectorId);
        return this.configurationService.renderConfigurationForCollector(collector, configurationId);
    }

    @GET
    @Path("/render/preview/{configurationId}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Render preview of a configuration template")
    public ConfigurationPreviewRenderResponse renderConfiguration(@ApiParam(name = "configurationId", required = true)
                                        @PathParam("configurationId") String configurationId) {
        String preview = this.configurationService.renderPreview(configurationId);
        return ConfigurationPreviewRenderResponse.create(preview);
    }

    @POST
    @Path("/configurations")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create new collector configuration")
    @AuditEvent(type = CollectorAuditEventTypes.CONFIGURATION_CREATE)
    public CollectorConfiguration createConfiguration(@ApiParam(name = "JSON body", required = true)
                                                      @Valid @NotNull CollectorConfiguration request) {
        CollectorConfiguration collectorConfiguration = configurationService.fromRequest(request);
        return configurationService.save(collectorConfiguration);
    }

    private CollectorConfigurationSummary getCollectorConfigurationSummary(CollectorConfiguration collectorConfiguration) {
        return CollectorConfigurationSummary.create(collectorConfiguration.id(),
                collectorConfiguration.name(), collectorConfiguration.backendId());
    }
}
