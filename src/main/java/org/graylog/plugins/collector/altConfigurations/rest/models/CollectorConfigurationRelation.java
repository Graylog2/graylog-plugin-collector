package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

@AutoValue
@JsonAutoDetect
public abstract class CollectorConfigurationRelation {
    @JsonProperty
    public abstract String backendId();

    @JsonProperty
    public abstract String configurationId();

    @JsonCreator
    public static CollectorConfigurationRelation create(@JsonProperty("backend_id") String backendId,
                                                        @JsonProperty("configuration_id") String configurationId) {
        return new AutoValue_CollectorConfigurationRelation(backendId, configurationId);
    }
}
