package org.graylog.plugins.collector.configurations.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.hibernate.validator.constraints.NotEmpty;
import org.mongojack.ObjectId;

@AutoValue
public abstract class CollectorConfigurationSnippet {
    @JsonProperty("snippet_id")
    @ObjectId
    public abstract String snippetId();

    @JsonProperty
    public abstract String backend();

    @JsonProperty
    public abstract String name();

    @JsonProperty
    public abstract String snippet();

    @JsonCreator
    public static CollectorConfigurationSnippet create(@JsonProperty("snippet_id") String snippetId,
                                                       @JsonProperty("backend") String backend,
                                                       @JsonProperty("name") String name,
                                                       @JsonProperty("snippet") String snippet) {
        if (snippetId == null) {
            snippetId = org.bson.types.ObjectId.get().toString();
        }
        return new AutoValue_CollectorConfigurationSnippet(snippetId, backend, name, snippet);
    }

    public static CollectorConfigurationSnippet create(@NotEmpty String backend,
                                                       @NotEmpty String name,
                                                       @NotEmpty String snippet) {
        return create(org.bson.types.ObjectId.get().toString(), backend, name, snippet);
    }
}
