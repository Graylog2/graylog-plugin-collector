package org.graylog.plugins.collector.altConfigurations.rest.resources;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog.plugins.collector.altConfigurations.AltConfigurationService;
import org.graylog.plugins.collector.altConfigurations.rest.responses.AltConfigurationTemplateRenderResponse;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfiguration;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.hibernate.validator.constraints.NotEmpty;

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
    @Path("/render/{id}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Render collector configuration template")
    public CollectorConfiguration renderConfiguration(@ApiParam(name = "id", required = true)
                                        @PathParam("id") @NotEmpty String id) {
        return this.altConfigurationService.renderConfiguration(id);
    }

}
