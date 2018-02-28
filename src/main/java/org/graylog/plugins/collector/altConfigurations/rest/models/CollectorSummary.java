package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.joda.time.DateTime;

@AutoValue
@JsonAutoDetect
public abstract class CollectorSummary {
    @JsonProperty
    public abstract String id();

    @JsonProperty("node_id")
    public abstract String nodeId();

    @JsonProperty("node_details")
    public abstract CollectorNodeDetailsSummary nodeDetails();

    @JsonProperty("last_seen")
    public abstract DateTime lastSeen();

    @JsonProperty("collector_version")
    public abstract String collectorVersion();

    @JsonProperty
    public abstract boolean active();

    @JsonCreator
    public static CollectorSummary create(@JsonProperty("id") String id,
                                          @JsonProperty("node_id") String nodeId,
                                          @JsonProperty("node_details") CollectorNodeDetailsSummary nodeDetails,
                                          @JsonProperty("last_seen") DateTime lastSeen,
                                          @JsonProperty("collector_version") String collectorVersion,
                                          @JsonProperty("active") boolean active) {
        return new AutoValue_CollectorSummary(id, nodeId, nodeDetails, lastSeen, collectorVersion, active);
    }
}
