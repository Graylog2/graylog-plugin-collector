package org.graylog.plugins.collector.altConfigurations.rest.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class NodeConfiguration {
    @JsonProperty
    public abstract String nodeId();

    @JsonProperty
    public abstract List<ConfigurationAssignment> assignments();

    @JsonCreator
    public static NodeConfiguration create(@JsonProperty("node_id") String nodeId,
                                           @JsonProperty("assignments") List<ConfigurationAssignment> assignments) {
        return new AutoValue_NodeConfiguration(nodeId, assignments);
    }
}
