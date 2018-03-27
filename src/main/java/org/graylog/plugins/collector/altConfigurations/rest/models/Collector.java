package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import com.google.common.base.Function;
import org.graylog.plugins.collector.altConfigurations.rest.responses.CollectorSummary;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.mongojack.Id;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;

import static com.google.common.base.MoreObjects.firstNonNull;

@AutoValue
@JsonAutoDetect
public abstract class Collector {
    @JsonProperty
    @Id
    @ObjectId
    @Nullable
    public abstract String id();

    @JsonProperty
    public abstract String nodeId();

    @JsonProperty
    public abstract String nodeName();

    @JsonProperty
    public abstract CollectorNodeDetails nodeDetails();

    @JsonProperty
    @Nullable
    public abstract List<CollectorConfigurationRelation> assignments();

    @JsonProperty
    public abstract String collectorVersion();

    @JsonProperty
    public abstract DateTime lastSeen();

    public static Builder builder() {
        return new AutoValue_Collector.Builder();
    }

    public abstract Builder toBuilder();

    @AutoValue.Builder
    public abstract static class Builder {
        public abstract Builder id(String id);
        public abstract Builder nodeId(String title);
        public abstract Builder nodeName(String title);
        public abstract Builder nodeDetails(CollectorNodeDetails nodeDetails);
        public abstract Builder assignments(List<CollectorConfigurationRelation> assignments);
        public abstract Builder collectorVersion(String collectorVersion);
        public abstract Builder lastSeen(DateTime lastSeen);
        public abstract Collector build();
    }

    @JsonCreator
    public static Collector create(@JsonProperty("id") @Id @ObjectId String id,
                                   @JsonProperty("node_id") String nodeId,
                                   @JsonProperty("node_name") String nodeName,
                                   @JsonProperty("node_details") CollectorNodeDetails nodeDetails,
                                   @JsonProperty("assignments") @Nullable List<CollectorConfigurationRelation> assignments,
                                   @JsonProperty("collector_version") String collectorVersion,
                                   @JsonProperty("last_seen") DateTime lastSeen) {

        return builder()
                .id(id)
                .nodeId(nodeId)
                .nodeName(nodeName)
                .nodeDetails(nodeDetails)
                .assignments(assignments)
                .collectorVersion(collectorVersion)
                .lastSeen(lastSeen)
                .build();
    }

    public static Collector create(@JsonProperty("node_id") String nodeId,
                                   @JsonProperty("node_name") String nodeName,
                                   @JsonProperty("node_details") CollectorNodeDetails nodeDetails,
                                   @JsonProperty("collector_version") String collectorVersion) {

        return builder()
                .id(new org.bson.types.ObjectId().toHexString())
                .nodeId(nodeId)
                .nodeName(nodeName)
                .nodeDetails(nodeDetails)
                .collectorVersion(collectorVersion)
                .lastSeen(DateTime.now(DateTimeZone.UTC))
                .build();
    }

    public CollectorSummary toSummary(Function<Collector, Boolean> isActiveFunction) {
        final Boolean isActive = isActiveFunction.apply(this);
        return CollectorSummary.create(
                nodeId(),
                nodeName(),
                nodeDetails(),
                firstNonNull(assignments(), new ArrayList<>()),
                lastSeen(),
                collectorVersion(),
                isActive != null && isActive);
    }
}
