/**
 * This file is part of Graylog.
 *
 * Graylog is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.graylog.plugins.collector.altConfigurations.rest.responses;


import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorAction;
import org.graylog.plugins.collector.altConfigurations.rest.requests.ConfigurationAssignment;

import javax.annotation.Nullable;
import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorRegistrationResponse {
    @JsonProperty
    public abstract CollectorRegistrationConfiguration collectorRegistrationConfiguration();

    @JsonProperty
    public abstract boolean configurationOverride();

    @JsonProperty
    @Nullable
    public abstract List<CollectorAction> actions();

    @JsonProperty
    @Nullable
    public abstract List<ConfigurationAssignment> assignments();

    @JsonCreator
    public static CollectorRegistrationResponse create(
            @JsonProperty("configuration") CollectorRegistrationConfiguration collectorRegistrationConfiguration,
            @JsonProperty("configuration_override") boolean configurationOverride,
            @JsonProperty("actions") @Nullable List<CollectorAction> actions,
            @JsonProperty("assignments") @Nullable List<ConfigurationAssignment> assignments) {
        return new AutoValue_CollectorRegistrationResponse(
                collectorRegistrationConfiguration,
                configurationOverride,
                actions,
                assignments);
    }
}
