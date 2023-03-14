/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog.plugins.collector.collectors;

import com.mongodb.client.MongoCollection;
import org.bson.Document;
import org.graylog.testing.mongodb.MongoDBFixtures;
import org.graylog.testing.mongodb.MongoDBInstance;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.DbEntity;
import org.graylog2.shared.bindings.ObjectMapperModule;
import org.graylog2.shared.bindings.ValidatorModule;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.jukito.JukitoRunner;
import org.jukito.UseModules;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import javax.validation.Validator;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@RunWith(JukitoRunner.class)
@UseModules({ObjectMapperModule.class, ValidatorModule.class, CollectorTestPasswordSecretModule.class})
public class CollectorServiceImplTest {
    @Rule
    public final MongoDBInstance mongodb = MongoDBInstance.createForClass();

    private CollectorService collectorService;

    @Before
    public void setUp(MongoJackObjectMapperProvider mapperProvider,
                      Validator validator) throws Exception {
        this.collectorService = new CollectorServiceImpl(mongodb.mongoConnection(), mapperProvider, validator);
    }

    @Test
    public void testCountEmptyCollection() throws Exception {
        final long result = this.collectorService.count();

        assertEquals(0, result);
    }

    @Test
    @MongoDBFixtures("collectorsMultipleDocuments.json")
    public void testCountNonEmptyCollection() throws Exception {
        final long result = this.collectorService.count();

        assertEquals(3, result);
    }

    @Test
    public void testSaveFirstRecord() throws Exception {
        final Collector collector = CollectorImpl.create("collectorId", "nodeId", "0.0.1", CollectorNodeDetails.create("DummyOS 1.0", null, null, null, null, null), DateTime.now(DateTimeZone.UTC));

        final Collector result = this.collectorService.save(collector);

        final String collectionName = CollectorImpl.class.getAnnotation(DbEntity.class).collection();
        MongoCollection<Document> collection = mongodb.mongoConnection().getMongoDatabase().getCollection(collectionName);
        Document document = collection.find().first();
        Document nodeDetails = document.get("node_details", Document.class);

        assertNotNull(result);
        assertEquals("collectorId", document.get("id"));
        assertEquals("nodeId", document.get("node_id"));
        assertEquals("0.0.1", document.get("collector_version"));
        assertEquals("DummyOS 1.0", nodeDetails.get("operating_system"));
    }

    @Test
    @MongoDBFixtures("collectorsMultipleDocuments.json")
    public void testAll() throws Exception {
        final List<Collector> collectors = this.collectorService.all();

        assertNotNull(collectors);
        assertEquals(3, collectors.size());
    }

    @Test
    public void testAllEmptyCollection() throws Exception {
        final List<Collector> collectors = this.collectorService.all();

        assertNotNull(collectors);
        assertEquals(0, collectors.size());
    }

    @Test
    @MongoDBFixtures("collectorsMultipleDocuments.json")
    public void testFindById() throws Exception {
        final String collector1id = "collector1id";

        final Collector collector = this.collectorService.findById(collector1id);

        assertNotNull(collector);
        assertEquals(collector1id, collector.getId());
    }

    @Test
    @MongoDBFixtures("collectorsMultipleDocuments.json")
    public void testFindByIdNonexisting() throws Exception {
        final String collector1id = "nonexisting";

        final Collector collector = this.collectorService.findById(collector1id);

        assertNull(collector);
    }

    @Test
    @MongoDBFixtures("collectorsMultipleDocuments.json")
    public void testFindByNodeId() throws Exception {
        final String nodeId = "uniqueid1";

        final List<Collector> collectors = this.collectorService.findByNodeId(nodeId);

        assertNotNull(collectors);
        assertEquals(1, collectors.size());

        for (Collector collector : collectors) {
            assertNotNull(collector);
            assertEquals(nodeId, collector.getNodeId());
        }
    }

    @Test
    @MongoDBFixtures("collectorsMultipleDocuments.json")
    public void testFindByNodeIdNonexisting() throws Exception {
        final String nodeId = "nonexisting";

        final List<Collector> collectors = this.collectorService.findByNodeId(nodeId);

        assertNotNull(collectors);
        assertEquals(0, collectors.size());
    }

    @Test
    @MongoDBFixtures("collectorsMultipleDocuments.json")
    public void testDestroy() throws Exception {
        final Collector collector = mock(Collector.class);
        when(collector.getId()).thenReturn("collector2id");

        final int result = this.collectorService.destroy(collector);

        final String collectionName = CollectorImpl.class.getAnnotation(DbEntity.class).collection();
        assertEquals(1, result);
        assertEquals(2, mongodb.mongoConnection().getMongoDatabase().getCollection(collectionName).countDocuments());
    }
}