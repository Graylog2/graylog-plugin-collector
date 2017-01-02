/**
 * This file is part of Graylog.
 *
 * Graylog is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.graylog.plugins.collector.configurations.rest.resources;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.hash.Hashing;
import io.swagger.annotations.*;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog.plugins.collector.audit.CollectorAuditEventTypes;
import org.graylog.plugins.collector.configurations.CollectorConfigurationService;
import org.graylog.plugins.collector.configurations.rest.ConfigurationEtagService;
import org.graylog.plugins.collector.configurations.rest.models.*;
import org.graylog.plugins.collector.configurations.rest.responses.CollectorConfigurationListResponse;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog2.audit.jersey.AuditEvent;
import org.graylog2.database.NotFoundException;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.hibernate.validator.constraints.NotEmpty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Api(value = "CollectorConfiguration", description = "Manage collector configurations")
@Path("/")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CollectorConfigurationResource extends RestResource implements PluginRestResource {
    private static final Logger LOG = LoggerFactory.getLogger(CollectorConfigurationResource.class);
    private final ObjectMapper mapper = new ObjectMapper();

    private final CollectorConfigurationService collectorConfigurationService;
    private final ConfigurationEtagService etagService;

    @Inject
    public CollectorConfigurationResource(CollectorConfigurationService collectorConfigurationService,
                                          ConfigurationEtagService etagService) {
        this.collectorConfigurationService = collectorConfigurationService;
        this.etagService = etagService;
    }

    @GET
    @Path("/{collectorId}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get a single collector configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Collector not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId."),
            @ApiResponse(code = 304, message = "Configuration didn't update.")
    })
    public Response getConfiguration(@Context Request request,
                                     @Context HttpHeaders httpHeaders,
                                     @ApiParam(name = "collectorId", required = true)
                                     @PathParam("collectorId") String collectorId,
                                     @ApiParam(name = "tags")
                                     @QueryParam("tags") String queryTags) throws NotFoundException {

        List<String> tags = parseQueryTags(queryTags);
        CollectorConfiguration collectorConfiguration;

        String ifNoneMatch = httpHeaders.getHeaderString("If-None-Match");
        Boolean etagCached = false;

        Response.ResponseBuilder builder = Response.noContent();

        // check if client is up to date with a known valid etag
        if (ifNoneMatch != null) {
            EntityTag etag = new EntityTag(ifNoneMatch.replaceAll("\"", ""));
            if (etagService.isPresent(etag.toString())) {
                etagCached = true;
                builder = Response.notModified();
                builder.tag(etag);
            }
        }

        // fetch configuration from database if client is outdated
        if (tags != null && !etagCached) {
            List<CollectorConfiguration> collectorConfigurationList = collectorConfigurationService.findByTags(tags);
            collectorConfiguration = collectorConfigurationService.merge(collectorConfigurationList);
            if (collectorConfiguration != null) {
                collectorConfiguration.tags().addAll(tags);

                // add new etag to cache
                String etagString = configToEtag(collectorConfiguration);

                EntityTag collectorConfigurationEtag = new EntityTag(etagString);
                builder = Response.ok(collectorConfiguration);
                builder.tag(collectorConfigurationEtag);
                etagService.put(collectorConfigurationEtag.toString());
            }
        }

        // set cache control
        CacheControl cacheControl = new CacheControl();
        cacheControl.setNoTransform(true);
        cacheControl.setPrivate(true);
        builder.cacheControl(cacheControl);

        return builder.build();
    }

    @GET
    @Path("/configurations")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List all collector configurations")
    public CollectorConfigurationListResponse listConfigurations() {
        final List<CollectorConfigurationSummary> result = this.collectorConfigurationService.loadAll().stream()
                .map(this::getCollectorConfigurationSummary)
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
    @AuditEvent(type = CollectorAuditEventTypes.TAGS_UPDATE)
    public CollectorConfiguration updateTags(@ApiParam(name = "id", required = true)
                                             @PathParam("id") String id,
                                             @ApiParam(name = "JSON body", required = true) List<String> tags) {
        etagService.invalidateAll();
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
    @AuditEvent(type = CollectorAuditEventTypes.OUTPUT_UPDATE)
    public Response updateOutput(@ApiParam(name = "id", required = true)
                                 @PathParam("id") @NotEmpty String id,
                                 @ApiParam(name = "output_id", required = true)
                                 @PathParam("output_id") @NotEmpty String outputId,
                                 @ApiParam(name = "JSON body", required = true)
                                 @Valid @NotNull CollectorOutput request) {
        etagService.invalidateAll();
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
    @AuditEvent(type = CollectorAuditEventTypes.INPUT_UPDATE)
    public Response updateInput(@ApiParam(name = "id", required = true)
                                @PathParam("id") @NotEmpty String id,
                                @ApiParam(name = "input_id", required = true)
                                @PathParam("input_id") @NotEmpty String inputId,
                                @ApiParam(name = "JSON body", required = true) @Valid @NotNull CollectorInput request) {
        etagService.invalidateAll();
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
    @AuditEvent(type = CollectorAuditEventTypes.SNIPPET_UPDATE)
    public Response updateSnippet(@ApiParam(name = "id", required = true)
                                  @PathParam("id") @NotEmpty String id,
                                  @ApiParam(name = "snippet_id", required = true)
                                  @PathParam("snippet_id") @NotEmpty String snippetId,
                                  @ApiParam(name = "JSON body", required = true)
                                  @Valid @NotNull CollectorConfigurationSnippet request) {
        etagService.invalidateAll();
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
    @AuditEvent(type = CollectorAuditEventTypes.CONFIGURATION_CREATE)
    public CollectorConfiguration createConfiguration(@ApiParam(name = "createDefaults")
                                                      @QueryParam("createDefaults") RestBoolean createDefaults,
                                                      @ApiParam(name = "JSON body", required = true)
                                                      @Valid @NotNull CollectorConfiguration request) {
        etagService.invalidateAll();
        CollectorConfiguration collectorConfiguration;
        if (createDefaults != null && createDefaults.getValue()) {
            collectorConfiguration = collectorConfigurationService.fromRequestWithDefaultSnippets(request);
        } else {
            collectorConfiguration = collectorConfigurationService.fromRequest(request);
        }
        collectorConfigurationService.save(collectorConfiguration);
        return collectorConfiguration;
    }

    @PUT
    @Path("/configurations/{id}/name")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_UPDATE)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Updates a collector configuration name")
    @AuditEvent(type = CollectorAuditEventTypes.CONFIGURATION_UPDATE)
    public CollectorConfiguration updateConfigurationName(@ApiParam(name = "id")
                                                          @PathParam("id") String id,
                                                          @ApiParam(name = "JSON body", required = true)
                                                          @Valid @NotNull CollectorConfiguration request) {
        etagService.invalidateAll();
        final CollectorConfiguration persistedConfiguration = collectorConfigurationService.findById(id);
        final CollectorConfiguration newConfiguration = collectorConfigurationService.fromRequest(request);

        final CollectorConfiguration updatedConfiguration = persistedConfiguration.toBuilder()
                .name(newConfiguration.name())
                .build();

        collectorConfigurationService.save(updatedConfiguration);
        return updatedConfiguration;
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
    @AuditEvent(type = CollectorAuditEventTypes.OUTPUT_CREATE)
    public Response createOutput(@ApiParam(name = "id", required = true)
                                 @PathParam("id") @NotEmpty String id,
                                 @ApiParam(name = "JSON body", required = true)
                                 @Valid @NotNull CollectorOutput request) {
        etagService.invalidateAll();
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
    @AuditEvent(type = CollectorAuditEventTypes.INPUT_CREATE)
    public Response createInput(@ApiParam(name = "id", required = true)
                                @PathParam("id") @NotEmpty String id,
                                @ApiParam(name = "JSON body", required = true)
                                @Valid @NotNull CollectorInput request) {
        etagService.invalidateAll();
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
    @AuditEvent(type = CollectorAuditEventTypes.SNIPPET_CREATE)
    public Response createSnippet(@ApiParam(name = "id", required = true)
                                  @PathParam("id") @NotEmpty String id,
                                  @ApiParam(name = "JSON body", required = true)
                                  @Valid @NotNull CollectorConfigurationSnippet request) {
        etagService.invalidateAll();
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.withSnippetFromRequest(id, request);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @POST
    @Path("/configurations/{id}/{name}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @ApiOperation(value = "Copy a configuration",
            notes = "This is a stateless method which copies a collector configuration to one with another name")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    @AuditEvent(type = CollectorAuditEventTypes.CONFIGURATION_CLONE)
    public Response copyConfiguration(@ApiParam(name = "id", required = true)
                               @PathParam("id") String id,
                               @PathParam("name") String name) throws NotFoundException {
        etagService.invalidateAll();
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.copyConfiguration(id, name);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @POST
    @Path("/configurations/{id}/outputs/{outputId}/{name}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @ApiOperation(value = "Copy a configuration output",
            notes = "This is a stateless method which copies a collector output to one with another name")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration or Output not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    @AuditEvent(type = CollectorAuditEventTypes.OUTPUT_CLONE)
    public Response copyOutput(@ApiParam(name = "id", required = true)
                               @PathParam("id") String id,
                               @PathParam("outputId") String outputId,
                               @PathParam("name") String name) throws NotFoundException {
        etagService.invalidateAll();
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.copyOutput(id, outputId, name);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @POST
    @Path("/configurations/{id}/inputs/{inputId}/{name}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @ApiOperation(value = "Copy a configuration input",
            notes = "This is a stateless method which copies a collector input to one with another name")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration or Input not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    @AuditEvent(type = CollectorAuditEventTypes.INPUT_CLONE)
    public Response copyInput(@ApiParam(name = "id", required = true)
                               @PathParam("id") String id,
                               @PathParam("inputId") String inputId,
                               @PathParam("name") String name) throws NotFoundException {
        etagService.invalidateAll();
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.copyInput(id, inputId, name);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @POST
    @Path("/configurations/{id}/snippets/{snippetId}/{name}")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_CREATE)
    @ApiOperation(value = "Copy a configuration snippet",
            notes = "This is a stateless method which copies a collector snippet to one with another name")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration or Snippet not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    @AuditEvent(type = CollectorAuditEventTypes.SNIPPET_CLONE)
    public Response copySnippet(@ApiParam(name = "id", required = true)
                               @PathParam("id") String id,
                               @PathParam("snippetId") String snippetId,
                               @PathParam("name") String name) throws NotFoundException {
        etagService.invalidateAll();
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.copySnippet(id, snippetId, name);
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
    @AuditEvent(type = CollectorAuditEventTypes.CONFIGURATION_DELETE)
    public void deleteConfiguration(@ApiParam(name = "id", required = true)
                                    @PathParam("id") String id) throws NotFoundException {
        etagService.invalidateAll();
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
    @AuditEvent(type = CollectorAuditEventTypes.OUTPUT_DELETE)
    public Response deleteOutput(@ApiParam(name = "id", required = true)
                                 @PathParam("id") String id,
                                 @PathParam("outputId") String outputId) throws NotFoundException {
        etagService.invalidateAll();
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
    @AuditEvent(type = CollectorAuditEventTypes.INPUT_DELETE)
    public void deleteInput(@ApiParam(name = "id", required = true)
                            @PathParam("id") String id,
                            @PathParam("inputId") String inputId) throws NotFoundException {
        etagService.invalidateAll();
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
    @AuditEvent(type = CollectorAuditEventTypes.SNIPPET_DELETE)
    public void deleteSnippet(@ApiParam(name = "id", required = true)
                              @PathParam("id") String id,
                              @PathParam("snippetId") String snippetId) throws NotFoundException {
        etagService.invalidateAll();
        collectorConfigurationService.deleteSnippet(id, snippetId);
    }

    private CollectorConfigurationSummary getCollectorConfigurationSummary(CollectorConfiguration collectorConfiguration) {
        return CollectorConfigurationSummary.create(collectorConfiguration.id(),
                collectorConfiguration.name(),
                collectorConfiguration.tags());
    }

    private List<String> parseQueryTags(String queryTags) {
        List<String> tags = null;
        if (queryTags != null) {
            try {
                tags = mapper.readValue(queryTags, new TypeReference<List<String>>(){});
            } catch (IOException e) {
                LOG.error("Can not parse provided collector tags: {}", queryTags);
                tags = null;
            }
        }
        return tags;
    }

    private String configToEtag(CollectorConfiguration collectorConfiguration) {
        return Hashing.md5()
                .hashInt(collectorConfiguration.hashCode())  // avoid negative values
                .toString();
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
