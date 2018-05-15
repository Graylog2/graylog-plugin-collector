package org.graylog.plugins.collector.services;

import com.mongodb.BasicDBObject;
import freemarker.cache.MultiTemplateLoader;
import freemarker.cache.StringTemplateLoader;
import freemarker.cache.TemplateLoader;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.graylog.plugins.collector.template.directives.IndentTemplateDirective;
import org.graylog.plugins.collector.template.loader.MongoDbTemplateLoader;
import org.graylog.plugins.collector.rest.models.Collector;
import org.graylog.plugins.collector.rest.models.CollectorConfiguration;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.graylog2.database.PaginatedDbService;
import org.graylog2.database.PaginatedList;
import org.graylog2.search.SearchQuery;
import org.mongojack.DBQuery;
import org.mongojack.DBSort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Singleton
public class ConfigurationService extends PaginatedDbService<CollectorConfiguration> {
    private static final Logger LOG = LoggerFactory.getLogger(ConfigurationService.class);
    private static final Configuration templateConfiguration = new Configuration(Configuration.VERSION_2_3_27);
    private static final StringTemplateLoader stringTemplateLoader = new StringTemplateLoader();

    private static final String COLLECTION_NAME = "collector_configurations";

    @Inject
    public ConfigurationService(MongoConnection mongoConnection,
                                MongoJackObjectMapperProvider mapper) {
        super(mongoConnection, mapper, CollectorConfiguration.class, COLLECTION_NAME);
        MongoDbTemplateLoader mongoDbTemplateLoader = new MongoDbTemplateLoader(db);
        MultiTemplateLoader multiTemplateLoader = new MultiTemplateLoader(new TemplateLoader[] {
                mongoDbTemplateLoader,
                stringTemplateLoader });
        templateConfiguration.setTemplateLoader(multiTemplateLoader);
        templateConfiguration.setSharedVariable("indent", new IndentTemplateDirective());
    }

    public CollectorConfiguration find(String id) {
        return db.findOne(DBQuery.is("_id", id));
    }

    public CollectorConfiguration findByName(String name) {
        return db.findOne(DBQuery.is(CollectorConfiguration.FIELD_NAME, name));
    }

    public List<CollectorConfiguration> all() {
        try (final Stream<CollectorConfiguration> collectorConfigurationStream = streamAll()) {
            return collectorConfigurationStream.collect(Collectors.toList());
        }
    }

    public PaginatedList<CollectorConfiguration> findPaginated(SearchQuery searchQuery, int page, int perPage, String sortField, String order) {
        final DBQuery.Query dbQuery = searchQuery.toDBQuery();
        final DBSort.SortBuilder sortBuilder = getSortBuilder(order, sortField);
        return findPaginatedWithQueryAndSort(dbQuery, sortBuilder, page, perPage);
    }

    @Override
    public CollectorConfiguration save(CollectorConfiguration configuration) {
        return db.findAndModify(DBQuery.is("_id", configuration.id()), new BasicDBObject(),
                new BasicDBObject(), false, configuration, true, true);
    }

    public CollectorConfiguration copyConfiguration(String id, String name) {
        CollectorConfiguration collectorConfiguration = find(id);
        return CollectorConfiguration.create(collectorConfiguration.backendId(), name, collectorConfiguration.color(), collectorConfiguration.template());
    }

    public CollectorConfiguration fromRequest(CollectorConfiguration request) {
        return CollectorConfiguration.create(
                request.backendId(),
                request.name(),
                request.color(),
                request.template());
    }

    public CollectorConfiguration fromRequest(String id, CollectorConfiguration request) {
        return CollectorConfiguration.create(
                id,
                request.backendId(),
                request.name(),
                request.color(),
                request.template());
    }

    public CollectorConfiguration renderConfigurationForCollector(Collector collector, CollectorConfiguration configuration) {
        Map<String, Object> context = new HashMap<>();

        context.put("nodeId", collector.nodeId());
        context.put("nodeName", collector.nodeName());
        context.put("collectorVersion", collector.collectorVersion());
        context.put("operatingSystem", collector.nodeDetails().operatingSystem());
        context.put("ip", collector.nodeDetails().ip());
        if (collector.nodeDetails().metrics().cpuIdle() != null) {
            context.put("cpuIdle", collector.nodeDetails().metrics().cpuIdle());
        }
        if (collector.nodeDetails().metrics().load1() != null) {
            context.put("load1", collector.nodeDetails().metrics().load1());
        }

        return CollectorConfiguration.create(
                configuration.id(),
                configuration.backendId(),
                configuration.name(),
                configuration.color(),
                renderTemplate(configuration.id(), context)
        );
    }

    public String renderPreview(String template) {
        Map<String, Object> context = new HashMap<>();
        context.put("collectorId", "<collector id>");
        context.put("nodeId", "<node id>");
        context.put("collectorVersion", "<version>");
        context.put("operatingSystem", "<operating system>");
        context.put("ip", "<ip>");
        context.put("cpuIdle", "<cpu idle>");
        context.put("load1", "<load 1>");

        String previewName = UUID.randomUUID().toString();
        stringTemplateLoader.putTemplate(previewName, template);
        String result = renderTemplate(previewName, context);
        stringTemplateLoader.removeTemplate(previewName);
        try {
            templateConfiguration.removeTemplateFromCache(previewName);
        } catch (IOException e) {
            LOG.debug("Couldn't remove temporary template from cache: " + e.getMessage());
        }

        return result;
    }

    private String renderTemplate(String configurationId, Map<String, Object> context) {
        Writer writer = new StringWriter();
        try {
            Template compiledTemplate = templateConfiguration.getTemplate(configurationId);
            compiledTemplate.process(context, writer);
        } catch (TemplateException | IOException e) {
            LOG.error("Failed to render template: ", e);
            return null;
        }

        return writer.toString();
    }
}
