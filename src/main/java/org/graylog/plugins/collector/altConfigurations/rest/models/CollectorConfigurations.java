package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorConfigurations {
    @JsonProperty
    public abstract List<CollectorConfigurationRelation> configurations();

    @JsonCreator
    public static CollectorConfigurations create(
            @JsonProperty("configurations") List<CollectorConfigurationRelation> configurations) {
        return new AutoValue_CollectorConfigurations(configurations);
    }
}
