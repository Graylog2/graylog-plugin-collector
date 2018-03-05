package org.graylog.plugins.collector.altConfigurations.rest.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import java.util.Collection;

@AutoValue
public abstract class CollectorListResponse {
    @JsonProperty
    public abstract long total();

    @JsonProperty
    public abstract Collection<CollectorSummary> collectors();

    @JsonCreator
    public static CollectorListResponse create(@JsonProperty("total") long total,
                                               @JsonProperty("collectors") Collection<CollectorSummary> collectors) {
        return new AutoValue_CollectorListResponse(total, collectors);
    }
}
