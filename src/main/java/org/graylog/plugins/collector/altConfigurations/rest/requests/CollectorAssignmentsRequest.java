package org.graylog.plugins.collector.altConfigurations.rest.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorAssignmentsRequest {
    @JsonProperty
    public abstract List<CollectorConfigurationRelationRequest> assignments();

    @JsonCreator
    public static CollectorAssignmentsRequest create(
            @JsonProperty("assignments") List<CollectorConfigurationRelationRequest> assignments) {
        return new AutoValue_CollectorAssignmentsRequest(assignments);
    }
}
