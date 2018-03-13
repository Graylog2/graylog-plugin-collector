package org.graylog.plugins.collector.altConfigurations.rest.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorBackend;

import java.util.Collection;

@AutoValue
public abstract class CollectorBackendListResponse {
    @JsonProperty
    public abstract long total();

    @JsonProperty
    public abstract Collection<CollectorBackend> backends();

    @JsonCreator
    public static CollectorBackendListResponse create(@JsonProperty("total") long total,
                                                      @JsonProperty("backends") Collection<CollectorBackend> backends) {
        return new AutoValue_CollectorBackendListResponse(total, backends);
    }
}
