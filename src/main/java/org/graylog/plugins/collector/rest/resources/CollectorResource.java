package org.graylog.plugins.collector.rest.resources;

import com.google.common.collect.ImmutableMap;
import com.google.common.hash.Hashing;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog.plugins.collector.audit.SidecarAuditEventTypes;
import org.graylog.plugins.collector.permissions.SidecarRestPermissions;
import org.graylog.plugins.collector.rest.models.Collector;
import org.graylog.plugins.collector.rest.models.CollectorSummary;
import org.graylog.plugins.collector.rest.responses.CollectorListResponse;
import org.graylog.plugins.collector.rest.responses.CollectorSummaryResponse;
import org.graylog.plugins.collector.rest.responses.ValidationResponse;
import org.graylog.plugins.collector.services.CollectorService;
import org.graylog.plugins.collector.services.EtagService;
import org.graylog2.audit.jersey.AuditEvent;
import org.graylog2.database.PaginatedList;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.search.SearchQuery;
import org.graylog2.search.SearchQueryField;
import org.graylog2.search.SearchQueryParser;
import org.graylog2.shared.rest.resources.RestResource;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

@Api(value = "Collectors", description = "Manage collectors")
@Path("/sidecar/collectors")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CollectorResource extends RestResource implements PluginRestResource {
    private final CollectorService collectorService;
    private final EtagService etagService;
    private final SearchQueryParser searchQueryParser;
    private static final ImmutableMap<String, SearchQueryField> SEARCH_FIELD_MAPPING = ImmutableMap.<String, SearchQueryField>builder()
            .put("id", SearchQueryField.create(Collector.FIELD_ID))
            .put("name", SearchQueryField.create(Collector.FIELD_NAME))
            .put("operating_system", SearchQueryField.create(Collector.FIELD_NODE_OPERATING_SYSTEM))
            .build();

    @Inject
    public CollectorResource(CollectorService collectorService,
                             EtagService etagService) {
        this.collectorService = collectorService;
        this.etagService = etagService;
        this.searchQueryParser = new SearchQueryParser(Collector.FIELD_NAME, SEARCH_FIELD_MAPPING);
    }

    @GET
    @Path("/{id}")
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Show collector details")
    public Collector getCollector(@ApiParam(name = "id", required = true)
                                  @PathParam("id") String id) {
        return this.collectorService.find(id);
    }

    @GET
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List all collectors")
    public Response listCollectors(@Context HttpHeaders httpHeaders) {
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

        // fetch collector list from database if client is outdated
        if (!etagCached) {
            final List<Collector> result = this.collectorService.all();
            CollectorListResponse collectorListResponse = CollectorListResponse.create(result.size(), result);

            // add new etag to cache
            String etagString = collectorsToEtag(collectorListResponse);

            EntityTag collectorsEtag = new EntityTag(etagString);
            builder = Response.ok(collectorListResponse);
            builder.tag(collectorsEtag);
            etagService.put(collectorsEtag.toString());
        }

        // set cache control
        CacheControl cacheControl = new CacheControl();
        cacheControl.setNoTransform(true);
        cacheControl.setPrivate(true);
        builder.cacheControl(cacheControl);

        return builder.build();
    }

    @GET
    @Path("/summary")
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.COLLECTORS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "List a summary of all collectors")
    public CollectorSummaryResponse listSummary(@ApiParam(name = "page") @QueryParam("page") @DefaultValue("1") int page,
                                                @ApiParam(name = "per_page") @QueryParam("per_page") @DefaultValue("50") int perPage,
                                                @ApiParam(name = "query") @QueryParam("query") @DefaultValue("") String query,
                                                @ApiParam(name = "sort",
                                                               value = "The field to sort the result on",
                                                               required = true,
                                                               allowableValues = "name,id,collector_id")
                                                           @DefaultValue(Collector.FIELD_NAME) @QueryParam("sort") String sort,
                                                @ApiParam(name = "order", value = "The sort direction", allowableValues = "asc, desc")
                                                           @DefaultValue("asc") @QueryParam("order") String order) {
        final SearchQuery searchQuery = searchQueryParser.parse(query);
        final PaginatedList<Collector> collectors = this.collectorService.findPaginated(searchQuery, page, perPage, sort, order);
        final List<CollectorSummary> summaries = collectors.stream()
                .map(CollectorSummary::create)
                .collect(Collectors.toList());

        return CollectorSummaryResponse.create(query, collectors.pagination(), sort, order, summaries);
    }

    @POST
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.COLLECTORS_CREATE)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Create a new collector")
    @AuditEvent(type = SidecarAuditEventTypes.COLLECTOR_CREATE)
    public Collector createCollector(@ApiParam(name = "JSON body", required = true)
                                     @Valid @NotNull Collector request) {
        etagService.invalidateAll();
        Collector collector = collectorService.fromRequest(request);
        return collectorService.save(collector);
    }

    @PUT
    @Path("/{id}")
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.COLLECTORS_UPDATE)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Update a collector")
    @AuditEvent(type = SidecarAuditEventTypes.COLLECTOR_UPDATE)
    public Collector updateCollector(@ApiParam(name = "id", required = true)
                                     @PathParam("id") String id,
                                     @ApiParam(name = "JSON body", required = true)
                                     @Valid @NotNull Collector request) {
        etagService.invalidateAll();
        Collector collector = collectorService.fromRequest(id, request);
        return collectorService.save(collector);
    }

    @POST
    @Path("/{id}/{name}")
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.COLLECTORS_CREATE)
    @ApiOperation(value = "Copy a collector")
    @AuditEvent(type = SidecarAuditEventTypes.COLLECTOR_CLONE)
    public Response copyCollector(@ApiParam(name = "id", required = true)
                                  @PathParam("id") String id,
                                  @PathParam("name") String name) throws NotFoundException {
        etagService.invalidateAll();
        final Collector collector = collectorService.copy(id, name);
        collectorService.save(collector);
        return Response.accepted().build();
    }

    @DELETE
    @Path("/{id}")
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.COLLECTORS_DELETE)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Delets a collector")
    @AuditEvent(type = SidecarAuditEventTypes.COLLECTOR_DELETE)
    public Response deleteCollector(@ApiParam(name = "id", required = true)
                                    @PathParam("id") String id) {
        int deleted = collectorService.delete(id);
        if (deleted == 0) {
            return Response.notModified().build();
        }
        etagService.invalidateAll();
        return Response.accepted().build();
    }

    @GET
    @Path("/validate")
    @RequiresAuthentication
    @RequiresPermissions(SidecarRestPermissions.CONFIGURATIONS_READ)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Validates collector name")
    public ValidationResponse validateCollector(@ApiParam(name = "name", required = true) @QueryParam("name") String name) {
        final Collector collector = collectorService.findByName(name);
        if (collector == null) {
            return ValidationResponse.create(false, null);
        }
        return ValidationResponse.create(true, "Collector with name \"" + name + "\" already exists");
    }

    private String collectorsToEtag(CollectorListResponse collectors) {
        return Hashing.md5()
                .hashInt(collectors.hashCode())  // avoid negative values
                .toString();
    }
}
