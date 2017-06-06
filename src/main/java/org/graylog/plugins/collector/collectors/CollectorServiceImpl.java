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

import com.google.common.collect.Lists;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import org.graylog.plugins.collector.collectors.rest.models.CollectorAction;
import org.graylog.plugins.collector.collectors.rest.models.requests.CollectorRegistrationRequest;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.CollectionName;
import org.graylog2.database.MongoConnection;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Period;
import org.mongojack.DBCursor;
import org.mongojack.DBQuery;
import org.mongojack.JacksonDBCollection;

import javax.inject.Inject;
import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class CollectorServiceImpl implements CollectorService {

    private final JacksonDBCollection<CollectorImpl, String> coll;
    private final JacksonDBCollection<CollectorActions, String> collActions;
    private final Validator validator;

    @Inject
    public CollectorServiceImpl(MongoConnection mongoConnection,
                                MongoJackObjectMapperProvider mapperProvider,
                                Validator validator) {
        this.validator = validator;
        final String collectionName = CollectorImpl.class.getAnnotation(CollectionName.class).value();
        final DBCollection dbCollection = mongoConnection.getDatabase().getCollection(collectionName);
        this.coll = JacksonDBCollection.wrap(dbCollection, CollectorImpl.class, String.class, mapperProvider.get());
        this.coll.createIndex(new BasicDBObject("id", 1), new BasicDBObject("unique", true));

        final String actionCollectionName = CollectorActions.class.getAnnotation(CollectionName.class).value();
        final DBCollection actionDbCollection = mongoConnection.getDatabase().getCollection(actionCollectionName);
        this.collActions = JacksonDBCollection.wrap(actionDbCollection, CollectorActions.class, String.class, mapperProvider.get());

    }

    @Override
    public long count() {
        return coll.count();
    }

    @Override
    public Collector save(Collector collector) {
        if (collector instanceof CollectorImpl) {
            final CollectorImpl collectorImpl = (CollectorImpl) collector;
            final Set<ConstraintViolation<CollectorImpl>> violations = validator.validate(collectorImpl);
            if (violations.isEmpty()) {
                return coll.findAndModify(DBQuery.is("id", collector.getId()), new BasicDBObject(), new BasicDBObject(), false, collectorImpl, true, true);
            } else {
                throw new IllegalArgumentException("Specified object failed validation: " + violations);
            }
        } else
            throw new IllegalArgumentException("Specified object is not of correct implementation type (" + collector.getClass() + ")!");
    }

    @Override
    public List<Collector> all() {
        return toAbstractListType(coll.find());
    }

    @Override
    public Collector findById(String id) {
        return coll.findOne(DBQuery.is("id", id));
    }

    @Override
    public List<Collector> findByNodeId(String nodeId) {
        return toAbstractListType(coll.find(DBQuery.is("node_id", nodeId)));
    }

    @Override
    public int destroy(Collector collector) {
        return coll.remove(DBQuery.is("id", collector.getId())).getN();
    }

    @Override
    public int destroyExpired(Period period) {
        int count = 0;
        final DateTime threshold = DateTime.now(DateTimeZone.UTC).minus(period);
        for (Collector collector : all())
            if (collector.getLastSeen().isBefore(threshold))
                count += destroy(collector);

        return count;
    }

    @Override
    public Collector fromRequest(String collectorId, CollectorRegistrationRequest request, String collectorVersion) {
        return CollectorImpl.create(collectorId, request.nodeId(), collectorVersion, CollectorNodeDetails.create(
                request.nodeDetails().operatingSystem(),
                request.nodeDetails().tags(),
                request.nodeDetails().ip(),
                request.nodeDetails().metrics(),
                request.nodeDetails().logFileList(),
                request.nodeDetails().statusList()),
                DateTime.now(DateTimeZone.UTC));
    }

    @Override
    public CollectorActions actionFromRequest(String collectorId, List<CollectorAction> actions) {
        CollectorActions collectorActions = findActionByCollector(collectorId, false);
        if (collectorActions == null) {
            return CollectorActions.create(collectorId, DateTime.now(DateTimeZone.UTC), actions);
        }
        List<CollectorAction> updatedActions = new ArrayList<>();
        for (final CollectorAction action : actions) {
            for (final CollectorAction existingsAction : collectorActions.getAction()) {
                if (!existingsAction.backend().equals(action.backend())) {
                    updatedActions.add(existingsAction);
                }
            }
            updatedActions.add(action);
        }
        return CollectorActions.create(collectorActions.getId(), collectorId, DateTime.now(DateTimeZone.UTC), updatedActions);
    }

    @Override
    public CollectorActions saveAction(CollectorActions collectorActions) {
        return collActions.findAndModify(DBQuery.is("collector_id", collectorActions.getCollectorId()), new BasicDBObject(), new BasicDBObject(), false, collectorActions, true, true);
    }

    @Override
    public CollectorActions findActionByCollector(String collectorId, boolean remove) {
        if (remove) {
            return collActions.findAndRemove(DBQuery.is("collector_id", collectorId));
        } else {
            return collActions.findOne(DBQuery.is("collector_id", collectorId));
        }
    }

    private List<Collector> toAbstractListType(DBCursor<CollectorImpl> collectors) {
        return toAbstractListType(collectors.toArray());
    }

    private List<Collector> toAbstractListType(List<CollectorImpl> collectors) {
        final List<Collector> result = Lists.newArrayListWithCapacity(collectors.size());
        result.addAll(collectors);

        return result;
    }
}
