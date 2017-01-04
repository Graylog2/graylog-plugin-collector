package org.graylog.plugins.collector.configurations.rest;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

@AutoValue
public abstract class CollectorConfigurationEtagInvalidation {

    @JsonProperty("etag")
    public abstract String etag();

    @JsonCreator
    public static CollectorConfigurationEtagInvalidation etag(@JsonProperty("etag") String etag) {
        return new AutoValue_CollectorConfigurationEtagInvalidation(etag);
    }

}
