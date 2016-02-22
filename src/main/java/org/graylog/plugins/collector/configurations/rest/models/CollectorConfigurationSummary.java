package org.graylog.plugins.collector.configurations.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.ObjectId;

import java.util.List;

@AutoValue
public abstract class CollectorConfigurationSummary {
    @JsonProperty("_id")
    @ObjectId
    public abstract String getId();

    @JsonProperty("name")
    public abstract String name();

    @JsonProperty("tags")
    public abstract List<String> tags();

    @JsonCreator
    public static CollectorConfigurationSummary create(@JsonProperty("_id") String id,
                                                       @JsonProperty("name") String name,
                                                       @JsonProperty("tags") List<String> tags) {
        return new AutoValue_CollectorConfigurationSummary(id, name, tags);
    }

}

