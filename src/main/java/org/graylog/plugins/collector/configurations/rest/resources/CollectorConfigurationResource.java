package org.graylog.plugins.collector.configurations.rest.resources;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.joschi.jadconfig.util.Duration;
import com.google.common.base.Function;
import com.google.common.primitives.Ints;
import com.wordnik.swagger.annotations.*;
import org.graylog.plugins.collector.collectors.Collector;
import org.graylog.plugins.collector.collectors.CollectorServiceImpl;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorList;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorSummary;
import org.graylog.plugins.collector.configurations.CollectorConfigurationService;
import org.graylog.plugins.collector.configurations.rest.models.*;
import org.graylog.plugins.collector.configurations.rest.responses.CollectorConfigurationListResponse;
import org.graylog.plugins.collector.configurations.rest.responses.CollectorInputListResponse;
import org.graylog.plugins.collector.configurations.rest.responses.CollectorOutputListResponse;
import org.graylog.plugins.collector.configurations.rest.responses.CollectorSnippetListResponse;
import org.graylog2.database.NotFoundException;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.hibernate.validator.constraints.NotEmpty;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.mail.internet.AddressException;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Api(value = "Collector configuration", description = "Manage collector configurations")
@Path("/")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CollectorConfigurationResource extends RestResource implements PluginRestResource {
    private static final Logger log = LoggerFactory.getLogger(CollectorConfigurationResource.class);
    private final ObjectMapper mapper = new ObjectMapper();
    private final LostCollectorFunction lostCollectorFunction;

    private final CollectorConfigurationService collectorConfigurationService;
    private final CollectorServiceImpl serverCollectorService;

    @Inject
    public CollectorConfigurationResource(CollectorConfigurationService collectorConfigurationService,
                                          CollectorServiceImpl serverCollectorService,
                                          @Named("collector_inactive_threshold") Duration inactiveThreshold) {
        this.collectorConfigurationService = collectorConfigurationService;
        this.serverCollectorService = serverCollectorService;
        this.lostCollectorFunction = new LostCollectorFunction(inactiveThreshold.toSeconds());
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List all collectors")
    public CollectorList listCollectors() {
        final List<Collector> collectors = serverCollectorService.all();
        final List<CollectorSummary> collectorSummaries = org.graylog.plugins.collector.collectors.Collectors.toSummaryList(collectors, lostCollectorFunction);
        return CollectorList.create(collectorSummaries);
    }

    @GET
    @Path("/{collectorId}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Get single collector configuration")
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
    @Path("/{id}/inputs")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List configuration inputs")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    public CollectorInputListResponse getInputs(@ApiParam(name = "id", required = true)
                                                @PathParam("id") String id) throws NotFoundException {
        final List<CollectorInput> collectorInputs = collectorConfigurationService.loadAllInputs(id);
        return CollectorInputListResponse.create(collectorInputs.size(), collectorInputs);
    }

    @GET
    @Path("/{collectorId}/outputs")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List collector outputs")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Collector not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    public CollectorOutputListResponse getOutputs(@ApiParam(name = "collectorId", required = true)
                                                  @PathParam("collectorId") String collectorId) throws NotFoundException {
        final List<CollectorOutput> collectorOutputs = collectorConfigurationService.loadAllOutputs(collectorId);
        return CollectorOutputListResponse.create(collectorOutputs.size(), collectorOutputs);
    }

    @GET
    @Path("/{collectorId}/snippets")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List collector configuration snippets")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Collector not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    public CollectorSnippetListResponse getSnippets(@ApiParam(name = "collectorId", required = true)
                                                    @PathParam("collectorId") String collectorId) throws NotFoundException {
        final List<CollectorConfigurationSnippet> collectorSnippets = collectorConfigurationService.loadAllSnippets(collectorId);
        return CollectorSnippetListResponse.create(collectorSnippets.size(), collectorSnippets);
    }

    @GET
    @Path("/configurations")
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
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List all used tags")
    public List<String> getTags() {
        return collectorConfigurationService.loadAllTags();
    }

    @GET
    @Path("/configurations/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Show collector configuration details")
    public CollectorConfiguration getConfigurations(@ApiParam(name = "id", required = true)
                                                    @PathParam("id") @NotEmpty String id) {
        return this.collectorConfigurationService.findById(id);
    }

    @PUT
    @Path("/configurations/{id}/tags")
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
    @ApiOperation(value = "Update a configuration input",
            notes = "This is a stateless method which updates a collector input")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    public Response updateInput(@ApiParam(name = "id", required = true)
                                 @PathParam("id") @NotEmpty String id,
                                 @ApiParam(name = "input_id", required = true)
                                 @PathParam("input_id") @NotEmpty String inputId,
                                 @ApiParam(name = "JSON body", required = true)
                                 @Valid @NotNull CollectorInput request) {
        final CollectorConfiguration collectorConfiguration = collectorConfigurationService.updateInputFromRequest(id, inputId, request);
        collectorConfigurationService.save(collectorConfiguration);

        return Response.accepted().build();
    }

    @PUT
    @Path("/configurations/{id}/snippets/{snippet_id}")
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
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create new collector configuration")
    public CollectorConfiguration createConfiguration(@ApiParam(name = "JSON body", required = true)
                                                      @Valid @NotNull CollectorConfiguration request) {
        CollectorConfiguration collectorConfiguration = collectorConfigurationService.fromRequest(request);
        collectorConfigurationService.save(collectorConfiguration);
        return collectorConfiguration;
    }

    @POST
    @Path("/configurations/{id}/outputs")
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
    @ApiOperation(value = "Delete output from configuration")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Configuration or Output not found."),
            @ApiResponse(code = 400, message = "Invalid ObjectId.")
    })
    public void deleteOutput(@ApiParam(name = "id", required = true)
                             @PathParam("id") String id,
                             @PathParam("outputId") String outputId) throws NotFoundException {
        collectorConfigurationService.deleteOutput(id, outputId);
    }

    @DELETE
    @Path("/configurations/{id}/inputs/{inputId}")
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

    // development helper; TODO: delete this!
    @GET
    @Path("/configuration/{name}/new")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create new collector configuration")
    public CollectorConfiguration newConfiguration(@ApiParam(name = "name", required = true)
                                                   @PathParam("name") String name) {
        String ip;
        try {
            InetAddress inetAddr = getLocalAddress();
            if (inetAddr != null) {
                ip = inetAddr.toString().replace("/", "");
            } else {
                throw new AddressException();
            }
        } catch (SocketException e) {
            log.warn("Can not get address for eth0");
            return null;
        } catch (AddressException e) {
            log.warn("Can not get address for eth0");
            return null;
        }

        List<String> tags = new ArrayList<>();
        List<CollectorInput> collectorInputs = new ArrayList<>();
        List<CollectorOutput> collectorOutputs = new ArrayList<>();
        List<CollectorConfigurationSnippet> collectorConfigurationSnippets = new ArrayList<>();

        HashMap<String, Object> inputProperties = new HashMap<>();
        inputProperties.put("Module", "im_msvistalog");
        collectorInputs.add(CollectorInput.create("nxlog", "windows-eventlog", "gelf-udp", inputProperties));

        HashMap<String, Object> outputProperties = new HashMap<>();
        outputProperties.put("Module", "om_udp");
        outputProperties.put("Host", ip);
        outputProperties.put("Port", "12201");
        outputProperties.put("OutputType", "GELF");
        collectorOutputs.add(CollectorOutput.create("nxlog", "gelf-udp", "gelf-udp-output", outputProperties));

        CollectorConfiguration newConfiguration = CollectorConfiguration.create(name, tags, collectorInputs,
                collectorOutputs, collectorConfigurationSnippets);
        collectorConfigurationService.save(newConfiguration);

        return newConfiguration;
    }

    private static InetAddress getLocalAddress() throws SocketException {
        Enumeration<NetworkInterface> ifaces = NetworkInterface.getNetworkInterfaces();
        while( ifaces.hasMoreElements() )
        {
          NetworkInterface iface = ifaces.nextElement();
          Enumeration<InetAddress> addresses = iface.getInetAddresses();

          while( addresses.hasMoreElements() )
          {
            InetAddress addr = addresses.nextElement();
            if( addr instanceof Inet4Address && !addr.isLoopbackAddress() )
            {
              return addr;
            }
          }
        }

        return null;
    }

    protected static class LostCollectorFunction implements Function<Collector, Boolean> {
        private final long timeOutInSeconds;

        @Inject
        public LostCollectorFunction(long timeOutInSeconds) {
            this.timeOutInSeconds = timeOutInSeconds;
        }

        @Override
        public Boolean apply(Collector collector) {
            final DateTime threshold = DateTime.now().minusSeconds(Ints.saturatedCast(timeOutInSeconds));
            return collector.getLastSeen().isAfter(threshold);
        }
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
}
