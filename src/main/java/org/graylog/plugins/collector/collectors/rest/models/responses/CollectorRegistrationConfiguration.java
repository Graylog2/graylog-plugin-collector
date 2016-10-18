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
package org.graylog.plugins.collector.collectors.rest.models.responses;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.system.CollectorSystemConfiguration;
import org.joda.time.Period;

import javax.annotation.Nullable;

@AutoValue
@JsonAutoDetect
public abstract class CollectorRegistrationConfiguration {
    @JsonProperty
    @Nullable
    public abstract Integer updateInterval();

    @JsonProperty
    @Nullable
    public abstract Boolean sendStatus();

    @JsonCreator
    public static CollectorRegistrationConfiguration create(@JsonProperty("update_interval") @Nullable Integer updateInterval,
                                                            @JsonProperty("send_status") @Nullable Boolean sendStatus) {
        return new AutoValue_CollectorRegistrationConfiguration(updateInterval, sendStatus);
    }

    public static CollectorRegistrationConfiguration createFromCollectorSystemConfiguration(CollectorSystemConfiguration config) {
        final Period updateInterval = config.collectorUpdateInterval();
        final Boolean sendStatus = config.collectorSendStatus();
        return new AutoValue_CollectorRegistrationConfiguration(updateInterval == null ? null : updateInterval.getSeconds(), sendStatus);
    }
}
