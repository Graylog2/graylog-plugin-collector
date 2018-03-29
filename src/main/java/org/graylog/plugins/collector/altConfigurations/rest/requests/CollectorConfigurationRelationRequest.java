package org.graylog.plugins.collector.altConfigurations.rest.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

@AutoValue
@JsonAutoDetect
public abstract class CollectorConfigurationRelationRequest {
    @JsonProperty
    public abstract String nodeId();

    @JsonProperty
    public abstract String backendId();

    @JsonProperty
    public abstract String configurationId();

    @JsonCreator
    public static CollectorConfigurationRelationRequest create(@JsonProperty("node_id") String collectorNodeId,
                                                               @JsonProperty("backend_id") String backendId,
                                                               @JsonProperty("configuration_id") String configurationId) {
        return new AutoValue_CollectorConfigurationRelationRequest(collectorNodeId, backendId, configurationId);
    }
}
