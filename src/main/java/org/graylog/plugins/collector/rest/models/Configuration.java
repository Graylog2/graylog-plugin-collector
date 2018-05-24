package org.graylog.plugins.collector.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.Id;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;

@AutoValue
public abstract class Configuration {
    public static final String FIELD_ID = "id";
    public static final String FIELD_BACKEND_ID = "backend_id";
    public static final String FIELD_NAME = "name";
    public static final String FIELD_COLOR = "color";
    public static final String FIELD_TEMPLATE = "template";

    @Id
    @ObjectId
    @Nullable
    @JsonProperty(FIELD_ID)
    public abstract String id();

    @JsonProperty(FIELD_BACKEND_ID)
    public abstract String backendId();

    @JsonProperty(FIELD_NAME)
    public abstract String name();

    @JsonProperty(FIELD_COLOR)
    public abstract String color();

    @JsonProperty(FIELD_TEMPLATE)
    public abstract String template();

    @JsonCreator
    public static Configuration create(@JsonProperty(FIELD_ID) String id,
                                       @JsonProperty(FIELD_BACKEND_ID) String backendId,
                                       @JsonProperty(FIELD_NAME) String name,
                                       @JsonProperty(FIELD_COLOR) String color,
                                       @JsonProperty(FIELD_TEMPLATE) String template) {
        return new AutoValue_Configuration(id, backendId, name, color, template);
    }

    public static Configuration create(String backend_id,
                                       String name,
                                       String color,
                                       String template) {
        return create(new org.bson.types.ObjectId().toHexString(),
                backend_id,
                name,
                color,
                template);
    }
}
