package org.graylog.plugins.collector.altConfigurations.rest.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorConfigurationRelation;

import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorConfigurationsRequest {
    @JsonProperty
    public abstract List<CollectorConfigurationRelation> configurations();

    @JsonCreator
    public static CollectorConfigurationsRequest create(@JsonProperty("configurations") List<CollectorConfigurationRelation> configurations) {
        return new AutoValue_CollectorConfigurationsRequest(configurations);
    }
}
