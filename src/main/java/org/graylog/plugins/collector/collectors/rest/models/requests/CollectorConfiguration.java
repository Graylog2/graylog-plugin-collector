package org.graylog.plugins.collector.collectors.rest.models.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@AutoValue
@JsonAutoDetect
public abstract class CollectorConfiguration {
    @JsonProperty("collector_name")
    public abstract String collectorName();

    @JsonProperty("configuration")
    @NotNull
    @Size(min = 1)
    public abstract String configuration();

    @JsonCreator
    public static CollectorConfiguration create(@JsonProperty("collector_name") String collectorName,
                                                @JsonProperty("configuration") String configuration) {
        return new AutoValue_CollectorConfiguration(collectorName, configuration);
    }
}
