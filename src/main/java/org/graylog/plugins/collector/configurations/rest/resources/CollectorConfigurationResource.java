package org.graylog.plugins.collector.configurations.rest.resources;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.joschi.jadconfig.util.Duration;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiParam;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog.plugins.collector.collectors.CollectorServiceImpl;
import org.graylog.plugins.collector.configurations.CollectorConfigurationService;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfiguration;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfigurationSnippet;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfigurationSummary;
import org.graylog.plugins.collector.configurations.rest.models.CollectorInput;
import org.graylog.plugins.collector.configurations.rest.models.CollectorOutput;
import org.graylog.plugins.collector.configurations.rest.responses.CollectorConfigurationListResponse;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog2.database.NotFoundException;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.hibernate.validator.constraints.NotEmpty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Api(value = "CollectorConfiguration", description = "Manage collector configurations")
@Path("/")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CollectorConfigurationResource extends RestResource implements PluginRestResource {
    private static final Logger log = LoggerFactory.getLogger(CollectorConfigurationResource.class);
    private final ObjectMapper mapper = new ObjectMapper();

    private final CollectorConfigurationService collectorConfigurationService;
    private final CollectorServiceImpl serverCollectorService;

    @Inject
    public CollectorConfigurationResource(CollectorConfigurationService collectorConfigurationService,
                                          CollectorServiceImpl serverCollectorService,
                                          @Named("collector_inactive_threshold") Duration inactiveThreshold) {
        this.collectorConfigurationService = collectorConfigurationService;
        this.serverCollectorService = serverCollectorService;
    }

    @GET
    @Path("/{collectorId}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get a single collector configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Collector not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    public CollectorConfiguration getConfiguration(@ApiParam(name = "collectorId", required = true)
                                                   @PathParam("collectorId") String collectorId,
                                                   @ApiParam(name = "tags")
                                                   @QueryParam("tags") String queryTags) throws NotFoundException {

        List tags = parseQueryTags(queryTags);
        CollectorConfiguration collectorConfiguration;
        if (tags != null) {
            List<CollectorConfiguration> collectorConfigurationList = collectorConfigurationService.findByTags(tags);
            collectorConfiguration = collectorConfigurationService.merge(collectorConfigurationList);
            if (collectorConfiguration != null) {
                collectorConfiguration.tags().addAll(tags);
            }
        } else {
            collectorConfiguration = collectorConfigurationService.findByCollectorId(collectorId);
        }

        return collectorConfiguration;
    }

    @GET
    @Path("/configurations")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List all collector configurations")
    public CollectorConfigurationListResponse listConfigurations() {
        final List<CollectorConfigurationSummary> result = this.collectorConfigurationService.loadAll().stream()
                .map(collectorConfiguration -> getCollectorConfigurationSummary(collectorConfiguration))
                .collect(Collectors.toList());

        return CollectorConfigurationListResponse.create(result.size(), result);
    }

    @GET
    @Path("/configurations/tags")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List all used tags")
    public List<String> getTags() {
        return collectorConfigurationService.loadAllTags();
    }

    @GET
    @Path("/configurations/{id}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Show collector configuration details")
    public CollectorConfiguration getConfigurations(@ApiParam(name = "id", required = true)
                                                    @PathParam("id") @NotEmpty String id) {
        return this.collectorConfigurationService.findById(id);
    }

    @PUT
    @Path("/configurations/{id}/tags")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_UPDATE)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public CollectorConfiguration updateTags(@ApiParam(name = "id", required = true)
                                             @PathParam("id") String id,
                                             @ApiParam(name = "JSON body", required = true) List<String> tags) {
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.withTagsFromRequest(id, tags);
        collectorConfigurationService.save(collectorConfiguration);
        return collectorConfiguration;
    }

    @PUT
    @Path("/configurations/{id}/outputs/{output_id}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_UPDATE)
    @ApiOperation(value = "Update a configuration output",
            notes = "This is a stateless method which updates a collector output")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    public Response updateOutput(@ApiParam(name = "id", required = true)
                                 @PathParam("id") @NotEmpty String id,
                                 @ApiParam(name = "output_id", required = true)
                                 @PathParam("output_id") @NotEmpty String outputId,
                                 @ApiParam(name = "JSON body", required = true)
                                 @Valid @NotNull CollectorOutput request) {
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.updateOutputFromRequest(id, outputId, request);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @PUT
    @Path("/configurations/{id}/inputs/{input_id}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_UPDATE)
    @ApiOperation(value = "Update a configuration input",
            notes = "This is a stateless method which updates a collector input")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    public Response updateInput(@ApiParam(name = "id", required = true)
                                @PathParam("id") @NotEmpty String id,
                                @ApiParam(name = "input_id", required = true)
                                @PathParam("input_id") @NotEmpty String inputId,
                                @ApiParam(name = "JSON body", required = true) @Valid @NotNull CollectorInput request) {
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.updateInputFromRequest(id, inputId, request);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @PUT
    @Path("/configurations/{id}/snippets/{snippet_id}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_UPDATE)
    @ApiOperation(value = "Update a configuration snippet",
            notes = "This is a stateless method which updates a collector snippet")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    public Response updateSnippet(@ApiParam(name = "id", required = true)
                                  @PathParam("id") @NotEmpty String id,
                                  @ApiParam(name = "snippet_id", required = true)
                                  @PathParam("snippet_id") @NotEmpty String snippetId,
                                  @ApiParam(name = "JSON body", required = true)
                                  @Valid @NotNull CollectorConfigurationSnippet request) {
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.updateSnippetFromRequest(id, snippetId, request);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @POST
    @Path("/configurations")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create new collector configuration")
    public CollectorConfiguration createConfiguration(@ApiParam(name = "createDefaults")
                                                      @QueryParam("createDefaults") RestBoolean createDefaults,
                                                      @ApiParam(name = "JSON body", required = true)
                                                      @Valid @NotNull CollectorConfiguration request) {
        CollectorConfiguration collectorConfiguration;
        if(createDefaults != null && createDefaults.getValue()) {
            collectorConfiguration = collectorConfigurationService.fromRequestWithDefaultSnippets(request);
        } else {
            collectorConfiguration = collectorConfigurationService.fromRequest(request);
        }
        collectorConfigurationService.save(collectorConfiguration);
        return collectorConfiguration;
    }

    @POST
    @Path("/configurations/{id}/outputs")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @ApiOperation(value = "Create a configuration output",
            notes = "This is a stateless method which inserts a collector output")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    public Response createOutput(@ApiParam(name = "id", required = true)
                                 @PathParam("id") @NotEmpty String id,
                                 @ApiParam(name = "JSON body", required = true)
                                 @Valid @NotNull CollectorOutput request) {
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.withOutputFromRequest(id, request);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @POST
    @Path("/configurations/{id}/inputs")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @ApiOperation(value = "Create a configuration input",
            notes = "This is a stateless method which inserts a collector input")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    public Response createInput(@ApiParam(name = "id", required = true)
                                @PathParam("id") @NotEmpty String id,
                                @ApiParam(name = "JSON body", required = true)
                                @Valid @NotNull CollectorInput request) {
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.withInputFromRequest(id, request);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @POST
    @Path("/configurations/{id}/snippets")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @ApiOperation(value = "Create a configuration snippet",
            notes = "This is a stateless method which inserts a collector configuration snippet")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    public Response createSnippet(@ApiParam(name = "id", required = true)
                                  @PathParam("id") @NotEmpty String id,
                                  @ApiParam(name = "JSON body", required = true)
                                  @Valid @NotNull CollectorConfigurationSnippet request) {
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.withSnippetFromRequest(id, request);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @DELETE
    @Path("/configurations/{id}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_DELETE)
    @ApiOperation(value = "Delete a collector configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    public void deleteConfiguration(@ApiParam(name = "id", required = true)
                                    @PathParam("id") String id) throws NotFoundException {
        collectorConfigurationService.delete(id);
    }

    @DELETE
    @Path("/configurations/{id}/outputs/{outputId}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_DELETE)
    @ApiOperation(value = "Delete output from configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration or Output not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId."),
            @ApiResponse(code = 412, message = "Still inputs assigned to output")
    })
    public Response deleteOutput(@ApiParam(name = "id", required = true)
                             @PathParam("id") String id,
                             @PathParam("outputId") String outputId) throws NotFoundException {
        int deleted = collectorConfigurationService.deleteOutput(id, outputId);
        switch (deleted) {
            case 0:
                return Response.status(Response.Status.NOT_FOUND).build();
            case -1:
                return Response.status(Response.Status.PRECONDITION_FAILED).build();
        }
        return Response.ok().build();
    }

    @DELETE
    @Path("/configurations/{id}/inputs/{inputId}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_DELETE)
    @ApiOperation(value = "Delete input form configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration or Input not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    public void deleteInput(@ApiParam(name = "id", required = true)
                            @PathParam("id") String id,
                            @PathParam("inputId") String inputId) throws NotFoundException {
        collectorConfigurationService.deleteInput(id, inputId);
    }

    @DELETE
    @Path("/configurations/{id}/snippets/{snippetId}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_DELETE)
    @ApiOperation(value = "Delete snippet from configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration or Snippet not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    public void deleteSnippet(@ApiParam(name = "id", required = true)
                              @PathParam("id") String id,
                              @PathParam("snippetId") String snippetId) throws NotFoundException {
        collectorConfigurationService.deleteSnippet(id, snippetId);
    }

    private CollectorConfigurationSummary getCollectorConfigurationSummary(CollectorConfiguration collectorConfiguration) {
        return CollectorConfigurationSummary.create(collectorConfiguration.getId(),
                                                    collectorConfiguration.name(),
                                                    collectorConfiguration.tags());
    }

    private List<String> parseQueryTags(String queryTags) {
        List tags = null;
        if (queryTags != null) {
            try {
                tags = mapper.readValue(queryTags, List.class);
            } catch (IOException e) {
                log.error("Can not parse provided collector tags");
                tags = null;
            }
        }
        return tags;
    }

    public static class RestBoolean {
        private static final RestBoolean FALSE = new RestBoolean(false);
        private static final RestBoolean TRUE = new RestBoolean(true);
        private boolean value;

        private RestBoolean(boolean value) {
            this.value = value;
        }

        public boolean getValue() {
            return this.value;
        }

        public static RestBoolean valueOf(String value) {
            switch (value.toLowerCase()) {
                case "true":
                case "yes":
                case "y": {
                    return RestBoolean.TRUE;
                }
                default: {
                    return RestBoolean.FALSE;
                }
            }
        }
    }
}
