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
import org.graylog.plugins.collector.collectors.rest.models.CollectorAction;
import org.graylog2.database.DbEntity;
import org.hibernate.validator.constraints.NotEmpty;
import org.joda.time.DateTime;
import org.mongojack.Id;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;
import java.util.List;

import static org.graylog.plugins.collector.permissions.CollectorRestPermissions.COLLECTORS_READ;
import static org.graylog2.database.DbEntity.NO_TITLE;

@AutoValue
@JsonAutoDetect
@DbEntity(collection = "collector_actions",
          titleField = NO_TITLE,
          readPermission = COLLECTORS_READ)
public abstract class CollectorActions {

    @JsonProperty("id")
    @Nullable
    @Id
    @ObjectId
    public abstract String getId();

    @JsonProperty("collector_id")
    public abstract String getCollectorId();

    @JsonProperty("created")
    public abstract DateTime getCreated();

    @JsonProperty("action")
    public abstract List<CollectorAction> getAction();

    @JsonCreator
    public static CollectorActions create(@JsonProperty("id") @Id @ObjectId String id,
                                          @JsonProperty("collector_id") String collectorId,
                                          @JsonProperty("created") DateTime created,
                                          @JsonProperty("action") List<CollectorAction> action) {
        return new AutoValue_CollectorActions(id, collectorId, created, action);
    }

    public static CollectorActions create(@NotEmpty String collector_id,
                                          @NotEmpty DateTime created,
                                          @NotEmpty List<CollectorAction> action) {
        return create(new org.bson.types.ObjectId().toHexString(), collector_id, created, action);
    }

}
