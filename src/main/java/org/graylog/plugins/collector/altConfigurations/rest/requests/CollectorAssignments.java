package org.graylog.plugins.collector.altConfigurations.rest.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorConfigurationRelation;

import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorAssignments {
    @JsonProperty
    public abstract List<CollectorConfigurationRelation> assignments();

    @JsonCreator
    public static CollectorAssignments create(
            @JsonProperty("assignments") List<CollectorConfigurationRelation> assignments) {
        return new AutoValue_CollectorAssignments(assignments);
    }
}
