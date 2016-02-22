package org.graylog.plugins.collector.configurations.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.hibernate.validator.constraints.NotEmpty;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;
import java.util.List;


@AutoValue
public abstract class CollectorConfiguration {
    @JsonProperty("_id")
    @Nullable
    @ObjectId
    public abstract String getId();

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
    public static CollectorConfiguration create(@JsonProperty("_id") String id,
                                                @JsonProperty("name") String name,
                                                @JsonProperty("tags") List<String> tags,
                                                @JsonProperty("inputs") List<CollectorInput> inputs,
                                                @JsonProperty("outputs") List<CollectorOutput> outputs,
                                                @JsonProperty("snippets") List<CollectorConfigurationSnippet> snippets) {
        return new AutoValue_CollectorConfiguration(id, name, tags, inputs, outputs, snippets);
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
}
