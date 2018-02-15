package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

@AutoValue
@JsonAutoDetect
public abstract class CollectorBackendSummary {
    @JsonProperty("name")
    public abstract String name();

    @JsonProperty("service_type")
    public abstract String serviceType();

    @JsonProperty("node_operating_system")
    public abstract String nodeOperatingSystem();

    @JsonCreator
    public static CollectorBackendSummary create(@JsonProperty("name") String name,
                                                 @JsonProperty("service_type") String serviceType,
                                                 @JsonProperty("node_operating_system") String nodeOperatingSystem) {
        return new AutoValue_CollectorBackendSummary(name, serviceType, nodeOperatingSystem);
    }

}
