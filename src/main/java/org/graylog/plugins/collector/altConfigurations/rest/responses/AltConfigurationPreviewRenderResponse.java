package org.graylog.plugins.collector.altConfigurations.rest.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

@AutoValue
public abstract class AltConfigurationPreviewRenderResponse {
    @JsonProperty
    public abstract String preview();

    @JsonCreator
    public static AltConfigurationPreviewRenderResponse create(
            @JsonProperty("preview") String preview) {
        return new AutoValue_AltConfigurationPreviewRenderResponse(preview);
    }

}
