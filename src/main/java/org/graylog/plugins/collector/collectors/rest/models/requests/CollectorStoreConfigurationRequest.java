package org.graylog.plugins.collector.collectors.rest.models.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorStoreConfigurationRequest {
    @JsonProperty("active_configurations")
    public abstract List<CollectorConfiguration> activeConfigurations();

    @JsonCreator
    public static CollectorStoreConfigurationRequest create(@JsonProperty("active_configurations") List<CollectorConfiguration> configuration) {
        return new AutoValue_CollectorStoreConfigurationRequest(configuration);
    }
}
