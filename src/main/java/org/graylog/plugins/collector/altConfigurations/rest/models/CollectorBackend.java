package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.Id;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;

import static org.apache.commons.lang3.ObjectUtils.firstNonNull;

@AutoValue
@JsonAutoDetect
public abstract class CollectorBackend {
    @Id
    @ObjectId
    @Nullable
    @JsonProperty("id")
    public abstract String id();

    @JsonProperty("name")
    public abstract String name();

    // exec, svc, systemd, ...
    @JsonProperty("service_type")
    public abstract String serviceType();

    @JsonProperty("node_operating_system")
    public abstract String nodeOperatingSystem();

    @JsonProperty("executable_path")
    public abstract String executablePath();

    @JsonProperty("configuration_path")
    public abstract String configurationPath();

    @JsonProperty("execute_parameters")
    public abstract List<String> executeParameters();

    @JsonProperty("validation_parameters")
    public abstract List<String> validationCommand();

    @JsonProperty("default_template")
    public abstract String defaultTemplate();

    public static Builder builder() {
        return new AutoValue_CollectorBackend.Builder();
    }

    public abstract Builder toBuilder();

    @AutoValue.Builder
    public abstract static class Builder {
        public abstract Builder id(String id);
        public abstract Builder name(String value);
        public abstract Builder serviceType(String serviceType);
        public abstract Builder nodeOperatingSystem(String nodeOperatingSystem);
        public abstract Builder executablePath(String executablePath);
        public abstract Builder configurationPath(String configurationPath);
        public abstract Builder executeParameters(List<String> executeParameters);
        public abstract Builder validationCommand(List<String> validationCommand);
        public abstract Builder defaultTemplate(String defaultTemplate);
        public abstract CollectorBackend build();
    }

    @JsonCreator
    public static CollectorBackend create(@JsonProperty("id") @Nullable String id,
                                          @JsonProperty("name") String name,
                                          @JsonProperty("service_type") String serviceType,
                                          @JsonProperty("node_operating_system") String nodeOperatingSystem,
                                          @JsonProperty("executable_path") String executablePath,
                                          @JsonProperty("configuration_path") String configurationPath,
                                          @JsonProperty("execute_parameters") @Nullable List<String> executeParameters,
                                          @JsonProperty("validation_parameters") @Nullable List<String> validationCommand,
                                          @JsonProperty("default_template") String defaultTemplate) {
        return builder()
                .id(id)
                .name(name)
                .serviceType(serviceType)
                .nodeOperatingSystem(nodeOperatingSystem)
                .executablePath(executablePath)
                .configurationPath(configurationPath)
                .executeParameters(firstNonNull(executeParameters, new ArrayList<>()))
                .validationCommand(firstNonNull(validationCommand, new ArrayList<>()))
                .defaultTemplate(defaultTemplate)
                .build();
    }
}
