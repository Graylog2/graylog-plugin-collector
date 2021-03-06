/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog.plugins.collector.collectors.rest.models.responses;


import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.collectors.rest.models.CollectorAction;

import javax.annotation.Nullable;
import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorRegistrationResponse {
    @JsonProperty("configuration")
    public abstract CollectorRegistrationConfiguration collectorRegistrationConfiguration();

    @JsonProperty("configuration_override")
    public abstract boolean configurationOverride();

    @JsonProperty("actions")
    @Nullable
    public abstract List<CollectorAction> actions();

    @JsonCreator
    public static CollectorRegistrationResponse create(@JsonProperty("configuration") CollectorRegistrationConfiguration collectorRegistrationConfiguration,
                                                       @JsonProperty("configuration_override") boolean configurationOverride,
                                                       @JsonProperty("actions") @Nullable List<CollectorAction> actions) {
        return new AutoValue_CollectorRegistrationResponse(collectorRegistrationConfiguration, configurationOverride, actions);
    }
}
