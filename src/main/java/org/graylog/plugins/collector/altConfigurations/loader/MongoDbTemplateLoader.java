package org.graylog.plugins.collector.altConfigurations.loader;

import freemarker.cache.TemplateLoader;
import org.bson.types.ObjectId;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorConfiguration;
import org.mongojack.DBQuery;
import org.mongojack.JacksonDBCollection;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;

public class MongoDbTemplateLoader implements TemplateLoader {
    private final JacksonDBCollection<CollectorConfiguration, ObjectId> dbCollection;

    public MongoDbTemplateLoader(JacksonDBCollection<CollectorConfiguration, ObjectId> dbCollection) {
        this.dbCollection = dbCollection;
    }

    @Override
    public Object findTemplateSource(String id) throws IOException {
        CollectorConfiguration collectorConfiguration;
        try {
            collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", unlocalize(id)));
        } catch (IllegalArgumentException e) {
            // no ObjectID so skip MongoDB loader and try with next one
            return null;
        }
        if (collectorConfiguration == null) {
            throw new IOException("Can't find template: " + unlocalize(id));
        }
        return collectorConfiguration.template();
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
        if (s.contains("_")) {
            return s.substring(0, s.indexOf("_"));
        } else {
            return s;
        }
    }
}
