package org.graylog.plugins.collector.configurations;


import com.google.common.collect.Iterables;
import com.mongodb.BasicDBObject;
import org.bson.types.ObjectId;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfiguration;
import org.graylog.plugins.collector.configurations.rest.models.CollectorConfigurationSnippet;
import org.graylog.plugins.collector.configurations.rest.models.CollectorInput;
import org.graylog.plugins.collector.configurations.rest.models.CollectorOutput;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.MongoConnection;
import org.mongojack.DBCursor;
import org.mongojack.DBQuery;
import org.mongojack.JacksonDBCollection;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

@Singleton
public class CollectorConfigurationService {
    private static final String COLLECTION_NAME = "collector_configurations";

    private final JacksonDBCollection<CollectorConfiguration, ObjectId> dbCollection;

    @Inject
    public CollectorConfigurationService(MongoConnection mongoConnection,
                                         MongoJackObjectMapperProvider mapper) {
        dbCollection = JacksonDBCollection.wrap(
                mongoConnection.getDatabase().getCollection(COLLECTION_NAME),
                CollectorConfiguration.class,
                ObjectId.class,
                mapper.get());
    }

    public List<CollectorConfiguration> loadAll() {
        final DBCursor<CollectorConfiguration> cursor = dbCollection.find();
        final List<CollectorConfiguration> collectorConfigurationList = new ArrayList<>();
        Iterables.addAll(collectorConfigurationList, cursor);
       return collectorConfigurationList;
    }

    public CollectorConfiguration findById(String id) {
        return dbCollection.findOne(DBQuery.is("_id", id));
    }

    public CollectorConfiguration findByCollectorId(String collectorId) {
        return dbCollection.findOne(DBQuery.is("collector_id", collectorId));
    }

    public List<CollectorConfiguration> findByTags(List tags) {
        final DBCursor<CollectorConfiguration> cursor = dbCollection.find(DBQuery.all("tags", tags));

        final List<CollectorConfiguration> result = new ArrayList<>();
        while (cursor.hasNext()) {
            result.add(cursor.next());
        }
        return result;
    }

    public CollectorConfiguration save(CollectorConfiguration configuration) {
        return dbCollection.findAndModify(DBQuery.is("_id", configuration.getId()), new BasicDBObject(),
                new BasicDBObject(), false, configuration, true, true);
    }

    public int delete(String id) {
        return dbCollection.remove(DBQuery.is("_id", id)).getN();
    }

    public CollectorConfiguration merge(List<CollectorConfiguration> configurations) {
        CollectorConfiguration result;
        final Iterator<CollectorConfiguration> cursor = configurations.iterator();
        if (cursor.hasNext()) {
            result = cursor.next();
            result.tags().clear();
            while (cursor.hasNext()) {
                result.mergeWith(cursor.next());
            }
            return result;
        }

        return null;
    }

    public int deleteInput(String id, String inputId) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        List<CollectorInput> inputList = collectorConfiguration.inputs();
        int deleted = 0;
        if (inputList != null) {
            for (int i = 0; i < inputList.size(); i++) {
                CollectorInput input = inputList.get(i);
                if (input.inputId().equals(inputId)) {
                    collectorConfiguration.inputs().remove(i);
                    deleted++;
                }
            }
            save(collectorConfiguration);
        }
        return deleted;
    }

    public int deleteOutput(String id, String outputId) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        List<CollectorOutput> outputList = collectorConfiguration.outputs();
        int deleted = 0;
        if (outputList != null) {
            for (int i = 0; i < outputList.size(); i++) {
                CollectorOutput output = outputList.get(i);
                if (output.outputId().equals(outputId)) {
                    collectorConfiguration.outputs().remove(i);
                    deleted++;
                }
            }
            save(collectorConfiguration);
        }
        return deleted;
    }

    public int deleteSnippet(String id, String snippetId) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        List<CollectorConfigurationSnippet> snippetList = collectorConfiguration.snippets();
        int deleted = 0;
        if (snippetList != null) {
            for (int i = 0; i < snippetList.size(); i++) {
                CollectorConfigurationSnippet snippet = snippetList.get(i);
                if (snippet.snippetId().equals(snippetId)) {
                    collectorConfiguration.snippets().remove(i);
                    deleted++;
                }
            }
            save(collectorConfiguration);
        }
        return deleted;
    }

    public List<CollectorInput> loadAllInputs(String id) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        return collectorConfiguration.inputs();
    }

    public List<CollectorOutput> loadAllOutputs(String id) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        return collectorConfiguration.outputs();
    }

    public List<CollectorConfigurationSnippet> loadAllSnippets(String id) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        return collectorConfiguration.snippets();
    }

    public List<String> loadAllTags() {
        List<String> tags = new ArrayList<>();
        DBCursor cursor = dbCollection.find();
        while (cursor.hasNext()) {
            CollectorConfiguration collectorConfiguration = (CollectorConfiguration) cursor.next();
            tags.addAll(collectorConfiguration.tags());
        }
        return tags;
    }

    public CollectorConfiguration fromRequest(CollectorConfiguration request) {
        CollectorConfiguration collectorConfiguration = CollectorConfiguration.create(request.name(),
                request.tags(), request.inputs(), request.outputs(), request.snippets());
        return collectorConfiguration;
    }

    public CollectorConfiguration withInputFromRequest(String id, CollectorInput input) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        collectorConfiguration.inputs().add(input);
        return collectorConfiguration;
    }

    public CollectorConfiguration withOutputFromRequest(String id, CollectorOutput output) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        collectorConfiguration.outputs().add(output);
        return collectorConfiguration;
    }

    public CollectorConfiguration withSnippetFromRequest(String id, CollectorConfigurationSnippet snippet) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        collectorConfiguration.snippets().add(snippet);
        return collectorConfiguration;
    }

    public CollectorConfiguration withTagsFromRequest(String id, List<String> tags) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        collectorConfiguration.tags().clear();
        collectorConfiguration.tags().addAll(tags);
        return collectorConfiguration;
    }

    public CollectorConfiguration updateInputFromRequest(String id, String inputId, CollectorInput request) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));

        ListIterator<CollectorInput> inputIterator = collectorConfiguration.inputs().listIterator();
        while (inputIterator.hasNext()) {
            int i = inputIterator.nextIndex();
            CollectorInput input = inputIterator.next();
            if(input.inputId().equals(inputId)){
                collectorConfiguration.inputs().set(i, request);
            }
        }
        return collectorConfiguration;
    }

    public CollectorConfiguration updateOutputFromRequest(String id, String outputId, CollectorOutput request) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));

        ListIterator<CollectorOutput> outputIterator = collectorConfiguration.outputs().listIterator();
        while (outputIterator.hasNext()) {
            int i = outputIterator.nextIndex();
            CollectorOutput output = outputIterator.next();
            if(output.outputId().equals(outputId)){
                collectorConfiguration.outputs().set(i, request);
            }
        }
        return collectorConfiguration;
    }

    public CollectorConfiguration updateSnippetFromRequest(String id, String snippetId, CollectorConfigurationSnippet request) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));

        ListIterator<CollectorConfigurationSnippet> snippetIterator = collectorConfiguration.snippets().listIterator();
        while (snippetIterator.hasNext()) {
            int i = snippetIterator.nextIndex();
            CollectorConfigurationSnippet snippet = snippetIterator.next();
            if(snippet.snippetId().equals(snippetId)){
                collectorConfiguration.snippets().set(i, request);
            }
        }
        return collectorConfiguration;
    }

}
