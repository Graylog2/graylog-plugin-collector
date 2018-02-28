package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import javax.annotation.Nullable;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorNodeDetailsSummary {
    @JsonProperty("operating_system")
    @NotNull
    @Size(min = 1)
    public abstract String operatingSystem();

    @JsonProperty("tags")
    @Nullable
    public abstract List<String> tags();

    @JsonProperty("ip")
    @Nullable
    public abstract String ip();


    @JsonProperty("metrics")
    @Nullable
    public abstract CollectorMetrics metrics();

    @JsonProperty("log_file_list")
    @Nullable
    public abstract List<CollectorLogFile> logFileList();

    @JsonProperty("status")
    @Nullable
    public abstract CollectorStatusList statusList();

    @JsonCreator
    public static CollectorNodeDetailsSummary create(@JsonProperty("operating_system") String operatingSystem,
                                                     @JsonProperty("tags") @Nullable List<String> tags,
                                                     @JsonProperty("ip") @Nullable String ip,
                                                     @JsonProperty("metrics") @Nullable CollectorMetrics metrics,
                                                     @JsonProperty("log_file_list") @Nullable List<CollectorLogFile> logFileList,
                                                     @JsonProperty("status") @Nullable CollectorStatusList statusList) {
        return new AutoValue_CollectorNodeDetailsSummary(operatingSystem, tags, ip, metrics, logFileList, statusList);
    }
}
