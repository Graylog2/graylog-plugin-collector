package org.graylog.plugins.collector.altConfigurations.loader;

import freemarker.cache.TemplateLoader;
import org.bson.types.ObjectId;
import org.graylog.plugins.collector.altConfigurations.AltConfigurationService;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfiguration;
import org.mongojack.DBQuery;
import org.mongojack.JacksonDBCollection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;

public class MongoDbTemplateLoader implements TemplateLoader {
    private static final Logger LOG = LoggerFactory.getLogger(AltConfigurationService.class);

    private final JacksonDBCollection<CollectorConfiguration, ObjectId> dbCollection;

    public MongoDbTemplateLoader(JacksonDBCollection<CollectorConfiguration, ObjectId> dbCollection) {
        this.dbCollection = dbCollection;
    }

    @Override
    public Object findTemplateSource(String id) throws IOException {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", unlocalize(id)));
        if (collectorConfiguration == null) {
            throw new IOException("Can't find template: " + unlocalize(id));
        }
        return collectorConfiguration.snippets().get(0).snippet();
    }

    @Override
    public long getLastModified(Object o) {
        return 0;
    }

    @Override
    public Reader getReader(Object snippet, String encoding) {
        return new StringReader((String)snippet);
    }

    @Override
    public void closeTemplateSource(Object o) {
    }

    private String unlocalize(String s) {
        return s.substring(0, s.indexOf("_"));
    }
}
