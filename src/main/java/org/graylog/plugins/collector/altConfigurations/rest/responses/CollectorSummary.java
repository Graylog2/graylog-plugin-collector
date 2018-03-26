package org.graylog.plugins.collector.altConfigurations.rest.responses;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorNodeDetails;
import org.joda.time.DateTime;

@AutoValue
@JsonAutoDetect
public abstract class CollectorSummary {
    @JsonProperty("node_id")
    public abstract String nodeId();

    @JsonProperty("node_name")
    public abstract String nodeName();

    @JsonProperty("node_details")
    public abstract CollectorNodeDetails nodeDetails();

    @JsonProperty("last_seen")
    public abstract DateTime lastSeen();

    @JsonProperty("collector_version")
    public abstract String collectorVersion();

    @JsonProperty
    public abstract boolean active();

    @JsonCreator
    public static CollectorSummary create(@JsonProperty("node_id") String nodeId,
                                          @JsonProperty("node_name") String nodeName,
                                          @JsonProperty("node_details") CollectorNodeDetails nodeDetails,
                                          @JsonProperty("last_seen") DateTime lastSeen,
                                          @JsonProperty("collector_version") String collectorVersion,
                                          @JsonProperty("active") boolean active) {
        return new AutoValue_CollectorSummary(nodeId, nodeName, nodeDetails, lastSeen, collectorVersion, active);
    }
}