package org.graylog.plugins.collector.altConfigurations.rest.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

@AutoValue
public abstract class AltConfigurationTemplateRenderResponse {
    @JsonProperty
    public abstract String configuration();

    @JsonCreator
    public static AltConfigurationTemplateRenderResponse create(
            @JsonProperty("configuration") String configuration) {
        return new AutoValue_AltConfigurationTemplateRenderResponse(configuration);
    }

}
