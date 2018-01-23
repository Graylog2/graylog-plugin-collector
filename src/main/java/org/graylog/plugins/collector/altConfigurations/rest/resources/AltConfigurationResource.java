package org.graylog.plugins.collector.altConfigurations.rest.resources;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.graylog.plugins.collector.altConfigurations.AltConfigurationService;
import org.graylog.plugins.collector.altConfigurations.rest.responses.AltConfigurationPreviewRenderResponse;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfiguration;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Api(value = "AltConfiguration", description = "Render collector configurations")
@Path("/altconfiguration")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AltConfigurationResource extends RestResource implements PluginRestResource {
    private final AltConfigurationService altConfigurationService;

    @Inject
    public AltConfigurationResource(AltConfigurationService altConfigurationService) {
        this.altConfigurationService = altConfigurationService;
    }

    @GET
    @Path("/render/{collectorId}/{configurationId}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Render collector configuration template")
    public CollectorConfiguration renderConfiguration(@ApiParam(name = "collectorId", required = true)
                                                      @PathParam("collectorId") String collectorId,
                                                      @ApiParam(name = "configurationId", required = true)
                                                      @PathParam("configurationId") String configurationId) {
        return this.altConfigurationService.renderConfigurationForCollector(collectorId, configurationId);
    }

    @GET
    @Path("/render/preview/{configurationId}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Render preview of a configuration template")
    public AltConfigurationPreviewRenderResponse renderConfiguration(@ApiParam(name = "configurationId", required = true)
                                        @PathParam("configurationId") String configurationId) {
        String preview = this.altConfigurationService.renderPreview(configurationId);
        return AltConfigurationPreviewRenderResponse.create(preview);
    }

}
