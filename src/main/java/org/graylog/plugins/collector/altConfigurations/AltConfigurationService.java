package org.graylog.plugins.collector.altConfigurations;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.bson.types.ObjectId;
import org.graylog.plugins.collector.altConfigurations.loader.MongoDbTemplateLoader;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfiguration;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfigurationSnippet;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.mongojack.DBQuery;
import org.mongojack.JacksonDBCollection;
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

@Singleton
public class AltConfigurationService {
    private static final Logger LOG = LoggerFactory.getLogger(AltConfigurationService.class);
    private static Configuration templateConfiguration = new Configuration(Configuration.VERSION_2_3_27);

    private static final String COLLECTION_NAME = "collector_configurations";
    private final JacksonDBCollection<CollectorConfiguration, ObjectId> dbCollection;

    @Inject
    public AltConfigurationService(MongoConnection mongoConnection,
                                   MongoJackObjectMapperProvider mapper) {
        dbCollection = JacksonDBCollection.wrap(
                mongoConnection.getDatabase().getCollection(COLLECTION_NAME),
                CollectorConfiguration.class,
                ObjectId.class,
                mapper.get());
        templateConfiguration.setTemplateLoader(new MongoDbTemplateLoader(dbCollection));
    }

    public CollectorConfiguration renderConfiguration(String id) {
        Writer writer = new StringWriter();
        Map<String, Object> context = new HashMap<>();

        context.put("name", "Graylog");

        try {
            Template compiledTemplate = templateConfiguration.getTemplate(id);
            compiledTemplate.process(context, writer);
        } catch (TemplateException | IOException e) {
            LOG.error("Failed to render configuration template: ", e);
            return null;
        }

        CollectorConfiguration oldConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        List<CollectorConfigurationSnippet> collectorConfigurationSnippets = oldConfiguration.snippets();
        CollectorConfigurationSnippet oldSnippet = collectorConfigurationSnippets.get(0);
        CollectorConfigurationSnippet renderedSnippet = CollectorConfigurationSnippet.create(
                oldSnippet.backend(),
                oldSnippet.name(),
                writer.toString()
        );
        collectorConfigurationSnippets.set(0, renderedSnippet);
        return CollectorConfiguration.create(
                oldConfiguration.name(),
                oldConfiguration.tags(),
                oldConfiguration.inputs(),
                oldConfiguration.outputs(),
                collectorConfigurationSnippets);
    }

}
