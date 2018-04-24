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

    @JsonCreator
    public static CollectorBackend create(@JsonProperty("id") String id,
                                          @JsonProperty("name") String name,
                                          @JsonProperty("service_type") String serviceType,
                                          @JsonProperty("node_operating_system") String nodeOperatingSystem,
                                          @JsonProperty("executable_path") String executablePath,
                                          @JsonProperty("configuration_path") String configurationPath,
                                          @JsonProperty("execute_parameters") @Nullable List<String> executeParameters,
                                          @JsonProperty("validation_parameters") @Nullable List<String> validationCommand,
                                          @JsonProperty("default_template") String defaultTemplate) {
        return new AutoValue_CollectorBackend(
                id,
                name,
                serviceType,
                nodeOperatingSystem,
                executablePath,
                configurationPath,
                firstNonNull(executeParameters, new ArrayList<>()),
                firstNonNull(validationCommand, new ArrayList<>()),
                defaultTemplate);
    }

    public static CollectorBackend create(String name,
                                          String serviceType,
                                          String nodeOperatingSystem,
                                          String executablePath,
                                          String configurationPath,
                                          List<String> executeParameters,
                                          List<String> validationCommand,
                                          String defaultTemplate) {
        return create(new org.bson.types.ObjectId().toHexString(),
                name,
                serviceType,
                nodeOperatingSystem,
                executablePath,
                configurationPath,
                executeParameters,
                validationCommand,
                defaultTemplate);
    }

}
