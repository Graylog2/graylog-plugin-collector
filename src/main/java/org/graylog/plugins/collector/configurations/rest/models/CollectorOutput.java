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
import org.hibernate.validator.constraints.NotEmpty;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;
import java.util.Map;

@AutoValue
public abstract class CollectorOutput {
    @JsonProperty("output_id")
    @ObjectId
    public abstract String outputId();

    @JsonProperty
    public abstract String backend();

    @JsonProperty
    public abstract String type();

    @JsonProperty
    public abstract String name();

    @JsonProperty
    @Nullable
    public abstract Map<String, Object> properties();

    @JsonCreator
    public static CollectorOutput create(@JsonProperty("output_id") String outputId,
                                         @JsonProperty("backend") String backend,
                                         @JsonProperty("type") String type,
                                         @JsonProperty("name") String name,
                                         @JsonProperty("properties") Map<String, Object> properties) {
        if (outputId == null) {
            outputId = org.bson.types.ObjectId.get().toString();
        }
        return new AutoValue_CollectorOutput(outputId, backend, type, name, properties);
    }

    public static CollectorOutput create(@NotEmpty String backend,
                                         @NotEmpty String type,
                                         @NotEmpty String name,
                                         @NotEmpty Map<String, Object> properties) {
        return create(org.bson.types.ObjectId.get().toString(), backend, type, name, properties);
    }

}
