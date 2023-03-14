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

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import com.google.common.base.Function;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorSummary;
import org.graylog2.database.DbEntity;
import org.joda.time.DateTime;

import static org.graylog.plugins.collector.permissions.CollectorRestPermissions.COLLECTORS_READ;
import static org.graylog2.database.DbEntity.NO_TITLE;

@AutoValue
@JsonAutoDetect
@DbEntity(collection = "collectors",
          titleField = NO_TITLE,
          readPermission = COLLECTORS_READ)
public abstract class CollectorImpl implements Collector {

    @JsonProperty("id")
    @Override
    public abstract String getId();

    @JsonProperty("node_id")
    @Override
    public abstract String getNodeId();

    @Override
    @JsonProperty("node_details")
    public abstract CollectorNodeDetails getNodeDetails();

    @Override
    @JsonProperty("collector_version")
    public abstract String getCollectorVersion();

    @Override
    public CollectorSummary toSummary(Function<Collector, Boolean> isActiveFunction) {
        final Boolean isActive = isActiveFunction.apply(this);
        return CollectorSummary.create(getId(), getNodeId(), getNodeDetails().toSummary(),
                getLastSeen(), getCollectorVersion(), isActive != null && isActive);
    }

    @JsonProperty("last_seen")
    @Override
    public abstract DateTime getLastSeen();

    @JsonCreator
    public static CollectorImpl create(@JsonProperty("_id") String objectId,
                                       @JsonProperty("id") String id,
                                       @JsonProperty("node_id") String nodeId,
                                       @JsonProperty("node_details") CollectorNodeDetails collectorNodeDetails,
                                       @JsonProperty("collector_version") String collectorVersion,
                                       @JsonProperty("last_seen") DateTime lastSeen) {
        return new AutoValue_CollectorImpl(id, nodeId, collectorNodeDetails, collectorVersion, lastSeen);
    }

    public static CollectorImpl create(String collectorId,
                                       String nodeId,
                                       String collectorVersion,
                                       CollectorNodeDetails collectorNodeDetails,
                                       DateTime lastSeen) {
        return new AutoValue_CollectorImpl(collectorId,
                nodeId,
                collectorNodeDetails,
                collectorVersion,
                lastSeen);
    }
}
