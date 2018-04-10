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
package org.graylog.plugins.collector.altConfigurations.rest.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.Id;
import org.mongojack.ObjectId;

@AutoValue
public abstract class CollectorConfigurationSummary {
    @JsonProperty("id")
    @Id
    @ObjectId
    public abstract String id();

    @JsonProperty("name")
    public abstract String name();

    @JsonProperty("backend_id")
    public abstract String backendId();

    @JsonProperty("color")
    public abstract String color();

    @JsonCreator
    public static CollectorConfigurationSummary create(@JsonProperty("id") @Id @ObjectId String id,
                                                       @JsonProperty("name") String name,
                                                       @JsonProperty("backend_id") String backendId,
                                                       @JsonProperty("color") String color) {
        return new AutoValue_CollectorConfigurationSummary(id, name, backendId, color);
    }

}

