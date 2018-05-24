package org.graylog.plugins.collector.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

@AutoValue
@JsonAutoDetect
public abstract class BackendSummary {
    @JsonProperty("id")
    public abstract String id();

    @JsonProperty("name")
    public abstract String name();

    @JsonProperty("service_type")
    public abstract String serviceType();

    @JsonProperty("node_operating_system")
    public abstract String nodeOperatingSystem();

    @JsonCreator
    public static BackendSummary create(@JsonProperty("id") String id,
                                        @JsonProperty("name") String name,
                                        @JsonProperty("service_type") String serviceType,
                                        @JsonProperty("node_operating_system") String nodeOperatingSystem) {
        return new AutoValue_BackendSummary(id, name, serviceType, nodeOperatingSystem);
    }

    public static BackendSummary create(Backend backend) {
        return create(
                backend.id(),
                backend.name(),
                backend.serviceType(),
                backend.nodeOperatingSystem());
    }
}
