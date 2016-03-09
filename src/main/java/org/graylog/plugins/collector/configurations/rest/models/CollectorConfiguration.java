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
import org.mongojack.Id;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;
import java.util.List;


@AutoValue
public abstract class CollectorConfiguration {
    @JsonProperty("id")
    @Nullable
    @Id
    @ObjectId
    public abstract String id();

    @JsonProperty("name")
    public abstract String name();

    @JsonProperty
    public abstract List<String> tags();

    @JsonProperty
    public abstract List<CollectorInput> inputs();

    @JsonProperty
    public abstract List<CollectorOutput> outputs();

    @JsonProperty
    public abstract List<CollectorConfigurationSnippet> snippets();

    @JsonCreator
    public static CollectorConfiguration create(@JsonProperty("id") @Id @ObjectId String id,
                                                @JsonProperty("name") String name,
                                                @JsonProperty("tags") List<String> tags,
                                                @JsonProperty("inputs") List<CollectorInput> inputs,
                                                @JsonProperty("outputs") List<CollectorOutput> outputs,
                                                @JsonProperty("snippets") List<CollectorConfigurationSnippet> snippets) {
        return builder()
                .id(id)
                .name(name)
                .tags(tags)
                .inputs(inputs)
                .outputs(outputs)
                .snippets(snippets)
                .build();
    }

    public static CollectorConfiguration create(@NotEmpty String name,
                                                @NotEmpty List<String> tags,
                                                @NotEmpty List<CollectorInput> inputs,
                                                @NotEmpty List<CollectorOutput> outputs,
                                                @NotEmpty List<CollectorConfigurationSnippet> snippets) {
        return create(new org.bson.types.ObjectId().toHexString(), name, tags, inputs, outputs, snippets);
    }

    public void mergeWith(CollectorConfiguration collectorConfiguration) {
        if (collectorConfiguration.inputs() != null) this.inputs().addAll(collectorConfiguration.inputs());
        if (collectorConfiguration.outputs() != null) this.outputs().addAll(collectorConfiguration.outputs());
        if (collectorConfiguration.snippets() != null) this.snippets().addAll(collectorConfiguration.snippets());
    }

    public static Builder builder() {
        return new AutoValue_CollectorConfiguration.Builder();
    }

    public abstract Builder toBuilder();

    @AutoValue.Builder
    public abstract static class Builder {
        public abstract CollectorConfiguration build();

        public abstract Builder id(String id);

        public abstract Builder name(String name);

        public abstract Builder tags(List<String> tags);

        public abstract Builder inputs(List<CollectorInput> inputs);

        public abstract Builder outputs(List<CollectorOutput> outputs);

        public abstract Builder snippets(List<CollectorConfigurationSnippet> snippets);
    }
}
