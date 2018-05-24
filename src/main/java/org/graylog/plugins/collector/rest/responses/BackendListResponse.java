package org.graylog.plugins.collector.rest.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.rest.models.Backend;

import java.util.Collection;

@AutoValue
public abstract class BackendListResponse {
    @JsonProperty
    public abstract long total();

    @JsonProperty
    public abstract Collection<Backend> backends();

    @JsonCreator
    public static BackendListResponse create(@JsonProperty("total") long total,
                                             @JsonProperty("backends") Collection<Backend> backends) {
        return new AutoValue_BackendListResponse(total, backends);
    }
}
