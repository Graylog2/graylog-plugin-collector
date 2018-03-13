package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.Id;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;
import java.util.List;

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

    @JsonProperty("validation_command")
    public abstract String validationCommand();

    @JsonCreator
    public static CollectorBackend create(@JsonProperty("id") String id,
                                          @JsonProperty("name") String name,
                                          @JsonProperty("service_type") String serviceType,
                                          @JsonProperty("node_operating_system") String nodeOperatingSystem,
                                          @JsonProperty("executable_path") String executablePath,
                                          @JsonProperty("configuration_path") String configurationPath,
                                          @JsonProperty("execute_parameters") List<String> executeParameters,
                                          @JsonProperty("validation_command") String validationCommand) {
        return new AutoValue_CollectorBackend(
                id,
                name,
                serviceType,
                nodeOperatingSystem,
                executablePath,
                configurationPath,
                executeParameters,
                validationCommand);
    }

    public static CollectorBackend create(String name,
                                          String serviceType,
                                          String nodeOperatingSystem,
                                          String executablePath,
                                          String configurationPath,
                                          List<String> executeParameters,
                                          String validationCommand) {
        return create(new org.bson.types.ObjectId().toHexString(),
                name,
                serviceType,
                nodeOperatingSystem,
                executablePath,
                configurationPath,
                executeParameters,
                validationCommand);
    }

}
