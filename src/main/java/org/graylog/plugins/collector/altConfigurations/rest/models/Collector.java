package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import com.google.common.base.Function;
import org.graylog2.database.CollectionName;
import org.joda.time.DateTime;

import javax.annotation.Nullable;
import java.util.Map;

@AutoValue
@JsonAutoDetect
@CollectionName("collectors")
public abstract class Collector {
    @JsonProperty
    public abstract String id();

    @JsonProperty
    public abstract String nodeId();

    @JsonProperty
    public abstract CollectorNodeDetails nodeDetails();

    @JsonProperty
    @Nullable
    public abstract Map<String, String> configurations();

    @JsonProperty
    public abstract String collectorVersion();

    public CollectorSummary toSummary(Function<Collector, Boolean> isActiveFunction) {
        final Boolean isActive = isActiveFunction.apply(this);
        return CollectorSummary.create(
                id(),
                nodeId(),
                nodeDetails().toSummary(),
                lastSeen(),
                collectorVersion(),
                isActive != null && isActive);
    }

    @JsonProperty("last_seen")
    public abstract DateTime lastSeen();

    @JsonCreator
    public static Collector create(@JsonProperty("_id") String objectId,
                                   @JsonProperty("id") String id,
                                   @JsonProperty("node_id") String nodeId,
                                   @JsonProperty("node_details") CollectorNodeDetails collectorNodeDetails,
                                   @JsonProperty("configurations") @Nullable Map<String, String> configurationList,
                                   @JsonProperty("collector_version") String collectorVersion,
                                   @JsonProperty("last_seen") DateTime lastSeen) {
        return new AutoValue_Collector(id, nodeId, collectorNodeDetails, configurationList, collectorVersion, lastSeen);
    }

    public static Collector create(String collectorId,
                                   String nodeId,
                                   String collectorVersion,
                                   CollectorNodeDetails collectorNodeDetails,
                                   Map<String, String> configurationList,
                                   DateTime lastSeen) {
        return new AutoValue_Collector(collectorId,
                nodeId,
                collectorNodeDetails,
                configurationList,
                collectorVersion,
                lastSeen);
    }

    public static Collector create(String collectorId,
                                   String nodeId,
                                   String collectorVersion,
                                   CollectorNodeDetails collectorNodeDetails,
                                   DateTime lastSeen) {
        return new AutoValue_Collector(collectorId,
                nodeId,
                collectorNodeDetails,
                null,
                collectorVersion,
                lastSeen);
    }
}
