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
package org.graylog.plugins.collector.collectors.rest.models.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.collectors.rest.models.CollectorNodeDetailsSummary;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@AutoValue
@JsonAutoDetect
public abstract class CollectorRegistrationRequest {
    @JsonProperty("node_id")
    @NotNull
    @Size(min = 1)
    public abstract String nodeId();

    @JsonProperty("node_details")
    public abstract CollectorNodeDetailsSummary nodeDetails();

    @JsonCreator
    public static CollectorRegistrationRequest create(@JsonProperty("node_id") String nodeId,
                                                      @JsonProperty("node_details") @Valid CollectorNodeDetailsSummary nodeDetails) {
        return new AutoValue_CollectorRegistrationRequest(nodeId, nodeDetails);
    }
}
