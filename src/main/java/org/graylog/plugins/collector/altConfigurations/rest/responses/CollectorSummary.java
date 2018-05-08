package org.graylog.plugins.collector.altConfigurations.rest.responses;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorNodeDetails;
import org.graylog.plugins.collector.altConfigurations.rest.requests.ConfigurationAssignment;
import org.joda.time.DateTime;

import javax.annotation.Nullable;
import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorSummary {
    @JsonProperty("node_id")
    public abstract String nodeId();

    @JsonProperty("node_name")
    public abstract String nodeName();

    @JsonProperty("node_details")
    public abstract CollectorNodeDetails nodeDetails();

    @JsonProperty("assignments")
    public abstract List<ConfigurationAssignment> assignments();

    @JsonProperty("last_seen")
    public abstract DateTime lastSeen();

    @JsonProperty("collector_version")
    public abstract String collectorVersion();

    @Nullable
    @JsonProperty("backends")
    public abstract List<String> backends();

    @JsonProperty
    public abstract boolean active();

    public static Builder builder() {
        return new AutoValue_CollectorSummary.Builder();
    }

    public abstract Builder toBuilder();

    @AutoValue.Builder
    public abstract static class Builder {
        public abstract Builder nodeId(String nodeId);
        public abstract Builder nodeName(String nodeName);
        public abstract Builder nodeDetails(CollectorNodeDetails nodeDetails);
        public abstract Builder assignments(List<ConfigurationAssignment> assignments);
        public abstract Builder lastSeen(DateTime lastSeen);
        public abstract Builder collectorVersion(String collectorVersion);
        public abstract Builder active(boolean active);
        public abstract Builder backends(List<String> backends);
        public abstract CollectorSummary build();
    }

    @JsonCreator
    public static CollectorSummary create(@JsonProperty("node_id") String nodeId,
                                          @JsonProperty("node_name") String nodeName,
                                          @JsonProperty("node_details") CollectorNodeDetails nodeDetails,
                                          @JsonProperty("assignments") List<ConfigurationAssignment> assignments,
                                          @JsonProperty("last_seen") DateTime lastSeen,
                                          @JsonProperty("collector_version") String collectorVersion,
                                          @JsonProperty("active") boolean active,
                                          @JsonProperty("backends") @Nullable List<String> backends) {
        return builder()
                .nodeId(nodeId)
                .nodeName(nodeName)
                .nodeDetails(nodeDetails)
                .assignments(assignments)
                .lastSeen(lastSeen)
                .collectorVersion(collectorVersion)
                .active(active)
                .backends(backends)
                .build();

    }
}
