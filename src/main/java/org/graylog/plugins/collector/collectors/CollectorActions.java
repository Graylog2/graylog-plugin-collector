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

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.collectors.rest.models.CollectorAction;
import org.graylog2.database.CollectionName;
import org.hibernate.validator.constraints.NotEmpty;
import org.joda.time.DateTime;
import org.mongojack.Id;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;
import java.util.List;

@AutoValue
@JsonAutoDetect
@CollectionName("collector_actions")
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
