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
package org.graylog.plugins.collector.configurations;


import com.google.common.collect.Iterables;
import com.mongodb.BasicDBObject;
import org.apache.commons.io.IOUtils;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Singleton
public class CollectorConfigurationService {
    private static final Logger LOG = LoggerFactory.getLogger(CollectorConfigurationService.class);

    private static final String COLLECTION_NAME = "collector_configurations";

    private final ClassLoader classLoader = this.getClass().getClassLoader();
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

    public List<CollectorConfiguration> findByTags(List tags) {
        final DBCursor<CollectorConfiguration> cursor = dbCollection.find().in("tags", tags);
        final List<CollectorConfiguration> result = new ArrayList<>();
        while (cursor.hasNext()) {
            result.add(cursor.next());
        }
        return result;
    }

    public CollectorConfiguration save(CollectorConfiguration configuration) {
        return dbCollection.findAndModify(DBQuery.is("_id", configuration.id()), new BasicDBObject(),
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
        List<CollectorInput> inputList = collectorConfiguration.inputs();
        if (inputList.stream().filter(input -> input.forwardTo().equals(outputId)).count() != 0) {
            return -1;
        }
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

    public List<String> loadAllTags() {
        List<String> tags = new ArrayList<>();
        DBCursor cursor = dbCollection.find();
        while (cursor.hasNext()) {
            CollectorConfiguration collectorConfiguration = (CollectorConfiguration) cursor.next();
            List<String> newTags = collectorConfiguration.tags().stream()
                    .filter(t -> !tags.contains(t))
                    .collect(Collectors.toList());
            tags.addAll(newTags);
        }
        return tags;
    }

    public CollectorConfiguration fromRequest(CollectorConfiguration request) {
        CollectorConfiguration collectorConfiguration = CollectorConfiguration.create(request.name(),
                request.tags(), request.inputs(), request.outputs(), request.snippets());
        return collectorConfiguration;
    }

    public CollectorConfiguration fromRequestWithDefaultSnippets(CollectorConfiguration request) {
        String nxlogDefaults;
        List<CollectorConfigurationSnippet> defaultSnippets = new ArrayList<>();

        try {
            nxlogDefaults = IOUtils.toString(classLoader.getResourceAsStream("snippets/defaults/nxlog.tmpl"));
        } catch (IOException e) {
            nxlogDefaults = "";
        }
        CollectorConfigurationSnippet nxlogSnippet = CollectorConfigurationSnippet.create("nxlog", "nxlog-defaults", nxlogDefaults);
        defaultSnippets.add(nxlogSnippet);

        return CollectorConfiguration.create(request.name(),
                request.tags(), request.inputs(), request.outputs(), defaultSnippets);
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
            if (input.inputId().equals(inputId)) {
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
            if (output.outputId().equals(outputId)) {
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
            if (snippet.snippetId().equals(snippetId)) {
                collectorConfiguration.snippets().set(i, request);
            }
        }
        return collectorConfiguration;
    }

    public CollectorConfiguration copyConfiguration(String id, String name) {
        CollectorConfiguration collectorConfigurationA = dbCollection.findOne(DBQuery.is("_id", id));
        HashMap<String, String> outputIdTranslation= new HashMap<>();
        List<CollectorOutput> outputList = new ArrayList<>();
        List<CollectorInput> inputList = new ArrayList<>();
        List<CollectorConfigurationSnippet> snippetList = new ArrayList<>();

        collectorConfigurationA.outputs().stream()
                .forEach(output -> {
                    CollectorOutput copiedOutput = CollectorOutput.create(output.backend(), output.type(), output.name(), output.properties());
                    outputIdTranslation.put(output.outputId(), copiedOutput.outputId());
                    outputList.add(copiedOutput);
                });
        collectorConfigurationA.inputs().stream()
                .forEach(input -> inputList.add(CollectorInput.create(input.type(), input.backend(), input.name(), outputIdTranslation.get(input.forwardTo()), input.properties())));
        collectorConfigurationA.snippets().stream()
                .forEach(snippet -> snippetList.add(CollectorConfigurationSnippet.create(snippet.backend(), snippet.name(), snippet.snippet())));

        List<String> tags = Collections.emptyList();
        CollectorConfiguration collectorConfigurationB = CollectorConfiguration.create(
                name,
                tags,
                inputList,
                outputList,
                snippetList);
        return collectorConfigurationB;
    }

    public CollectorConfiguration copyOutput(String id, String outputId, String name) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        List<CollectorOutput> outputList = new ArrayList<>();

        collectorConfiguration.outputs().stream()
                .filter(output -> output.outputId().equals(outputId))
                .forEach(output -> outputList.add(CollectorOutput.create(output.backend(), output.type(), name, output.properties())));
        collectorConfiguration.outputs().addAll(outputList);
        return collectorConfiguration;
    }

    public CollectorConfiguration copyInput(String id, String inputId, String name) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        List<CollectorInput> inputList = new ArrayList<>();

        collectorConfiguration.inputs().stream()
                .filter(input -> input.inputId().equals(inputId))
                .forEach(input -> inputList.add(CollectorInput.create(input.type(), input.backend(), name, input.forwardTo(), input.properties())));
        collectorConfiguration.inputs().addAll(inputList);
        return collectorConfiguration;
    }

    public CollectorConfiguration copySnippet(String id, String snippetId, String name) {
        CollectorConfiguration collectorConfiguration = dbCollection.findOne(DBQuery.is("_id", id));
        List<CollectorConfigurationSnippet> snippetList = new ArrayList<>();

        collectorConfiguration.snippets().stream()
                .filter(snippet -> snippet.snippetId().equals(snippetId))
                .forEach(snippet -> snippetList.add(CollectorConfigurationSnippet.create(snippet.backend(), name, snippet.snippet())));
        collectorConfiguration.snippets().addAll(snippetList);
        return collectorConfiguration;
    }
}
