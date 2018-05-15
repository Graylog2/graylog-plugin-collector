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
package org.graylog.plugins.collector.collectors;

import com.lordofthejars.nosqlunit.annotation.CustomComparisonStrategy;
import com.lordofthejars.nosqlunit.annotation.IgnorePropertyValue;
import com.lordofthejars.nosqlunit.annotation.ShouldMatchDataSet;
import com.lordofthejars.nosqlunit.annotation.UsingDataSet;
import com.lordofthejars.nosqlunit.core.LoadStrategyEnum;
import com.lordofthejars.nosqlunit.mongodb.InMemoryMongoDb;
import com.lordofthejars.nosqlunit.mongodb.MongoFlexibleComparisonStrategy;
import org.graylog.plugins.collector.services.CollectorService;
import org.graylog.plugins.collector.services.ConfigurationService;
import org.graylog.plugins.collector.services.BackendService;
import org.graylog.plugins.collector.rest.models.Collector;
import org.graylog.plugins.collector.rest.models.CollectorNodeDetails;
import org.graylog.plugins.collector.database.MongoConnectionRule;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.shared.bindings.ObjectMapperModule;
import org.graylog2.shared.bindings.ValidatorModule;
import org.jukito.JukitoRunner;
import org.jukito.UseModules;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;

import javax.validation.Validator;
import java.util.List;

import static com.lordofthejars.nosqlunit.mongodb.InMemoryMongoDb.InMemoryMongoRuleBuilder.newInMemoryMongoDbRule;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@RunWith(JukitoRunner.class)
@UseModules({ObjectMapperModule.class, ValidatorModule.class})
@CustomComparisonStrategy(comparisonStrategy = MongoFlexibleComparisonStrategy.class)
public class CollectorServiceImplTest {
    @Mock
    private BackendService backendService;

    @Mock private ConfigurationService configurationService;

    @ClassRule
    public static final InMemoryMongoDb IN_MEMORY_MONGO_DB = newInMemoryMongoDbRule().build();

    @Rule
    public MongoConnectionRule mongoRule = MongoConnectionRule.build("test");

    private CollectorService collectorService;

    @Before
    public void setUp(MongoJackObjectMapperProvider mapperProvider,
                      Validator validator) throws Exception {
        this.collectorService = new CollectorService(backendService, configurationService,  mongoRule.getMongoConnection(), mapperProvider, validator);
    }

    @Test
    @UsingDataSet(loadStrategy = LoadStrategyEnum.DELETE_ALL)
    public void testCountEmptyCollection() throws Exception {
        final long result = this.collectorService.count();

        assertEquals(0, result);
    }

    @Test
    @UsingDataSet(locations = "collectorsMultipleDocuments.json", loadStrategy = LoadStrategyEnum.CLEAN_INSERT)
    public void testCountNonEmptyCollection() throws Exception {
        final long result = this.collectorService.count();

        assertEquals(3, result);
    }

    @Test
    @UsingDataSet(loadStrategy = LoadStrategyEnum.DELETE_ALL)
    @ShouldMatchDataSet(location = "collectorsSingleDataset.json")
    @IgnorePropertyValue(properties = {"_id", "last_seen"})
    public void testSaveFirstRecord() throws Exception {
        final Collector collector = Collector.create(
                "nodeId",
                "nodeName",
                CollectorNodeDetails.create(
                        "DummyOS 1.0",
                        null,
                        null,
                        null,
                        null),
                "0.0.1"
                );

        final Collector result = this.collectorService.save(collector);

        assertNotNull(result);
    }

    @Test
    @UsingDataSet(locations = "collectorsMultipleDocuments.json", loadStrategy = LoadStrategyEnum.CLEAN_INSERT)
    public void testAll() throws Exception {
        final List<Collector> collectors = this.collectorService.all();

        assertNotNull(collectors);
        assertEquals(3, collectors.size());
    }

    @Test
    @UsingDataSet(loadStrategy = LoadStrategyEnum.DELETE_ALL)
    public void testAllEmptyCollection() throws Exception {
        final List<Collector> collectors = this.collectorService.all();

        assertNotNull(collectors);
        assertEquals(0, collectors.size());
    }

    @Test
    @UsingDataSet(locations = "collectorsMultipleDocuments.json", loadStrategy = LoadStrategyEnum.CLEAN_INSERT)
    public void testFindById() throws Exception {
        final String collector1id = "collector1id";

        final Collector collector = this.collectorService.findByNodeId(collector1id);

        assertNotNull(collector);
        assertEquals(collector1id, collector.nodeId());
    }

    @Test
    @UsingDataSet(locations = "collectorsMultipleDocuments.json", loadStrategy = LoadStrategyEnum.CLEAN_INSERT)
    public void testFindByIdNonexisting() throws Exception {
        final String collector1id = "nonexisting";

        final Collector collector = this.collectorService.findByNodeId(collector1id);

        assertNull(collector);
    }

    @Test
    @UsingDataSet(locations = "collectorsMultipleDocuments.json", loadStrategy = LoadStrategyEnum.CLEAN_INSERT)
    @ShouldMatchDataSet
    public void testDestroy() throws Exception {
        final Collector collector = mock(Collector.class);
        when(collector.nodeId()).thenReturn("collector2id");

        final int result = this.collectorService.delete(collector.id());

        assertEquals(1, result);
    }
}