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
package org.graylog.plugins.collector.configurations.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.Id;
import org.mongojack.ObjectId;

import java.util.List;

@AutoValue
public abstract class CollectorConfigurationSummary {
    @JsonProperty("id")
    @Id
    @ObjectId
    public abstract String id();

    @JsonProperty("name")
    public abstract String name();

    @JsonProperty("tags")
    public abstract List<String> tags();

    @JsonCreator
    public static CollectorConfigurationSummary create(@JsonProperty("id") @Id @ObjectId String id,
                                                       @JsonProperty("name") String name,
                                                       @JsonProperty("tags") List<String> tags) {
        return new AutoValue_CollectorConfigurationSummary(id, name, tags);
    }

}

