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
package org.graylog.plugins.collector.system;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.joda.time.Period;

import javax.annotation.Nullable;

import static com.google.common.base.MoreObjects.firstNonNull;

@JsonAutoDetect
@AutoValue
public abstract class CollectorSystemConfiguration {

    private static final Period DEFAULT_EXPIRATION_PERIOD = Period.days(14);
    private static final Period DEFAULT_INACTIVE_THRESHOLD = Period.minutes(1);
    private static final Period DEFAULT_UPDATE_INTERVAL = Period.seconds(30);
    private static final boolean DEFAULT_SEND_STATUS = true;
    private static final boolean DEFAULT_CONFIG_OVERRIDE = false;

    @JsonProperty("collector_expiration_threshold")
    public abstract Period collectorExpirationThreshold();

    @JsonProperty("collector_inactive_threshold")
    public abstract Period collectorInactiveThreshold();

    @JsonProperty("collector_update_interval")
    public abstract Period collectorUpdateInterval();

    @JsonProperty("collector_send_status")
    public abstract boolean collectorSendStatus();

    @JsonProperty("collector_configuration_override")
    public abstract boolean collectorConfigurationOverride();

    @JsonCreator
    public static CollectorSystemConfiguration create(@JsonProperty("collector_expiration_threshold") Period expirationThreshold,
                                                      @JsonProperty("collector_inactive_threshold") Period inactiveThreshold,
                                                      @JsonProperty("collector_update_interval") @Nullable Period updateInterval,
                                                      @JsonProperty("collector_send_status") @Nullable Boolean sendStatus,
                                                      @JsonProperty("collector_configuration_override") @Nullable Boolean configurationOverride) {
        return builder()
                .collectorExpirationThreshold(expirationThreshold)
                .collectorInactiveThreshold(inactiveThreshold)
                .collectorUpdateInterval(firstNonNull(updateInterval, DEFAULT_UPDATE_INTERVAL))
                .collectorSendStatus(firstNonNull(sendStatus, DEFAULT_SEND_STATUS))
                .collectorConfigurationOverride(firstNonNull(configurationOverride, DEFAULT_CONFIG_OVERRIDE))
                .build();
    }

    public static CollectorSystemConfiguration defaultConfiguration() {
        return builder()
                .collectorExpirationThreshold(DEFAULT_EXPIRATION_PERIOD)
                .collectorInactiveThreshold(DEFAULT_INACTIVE_THRESHOLD)
                .collectorUpdateInterval(DEFAULT_UPDATE_INTERVAL)
                .collectorSendStatus(DEFAULT_SEND_STATUS)
                .collectorConfigurationOverride(DEFAULT_CONFIG_OVERRIDE)
                .build();
    }

    public static Builder builder() {
        return new AutoValue_CollectorSystemConfiguration.Builder();
    }

    public abstract Builder toBuilder();

    @AutoValue.Builder
    public static abstract class Builder {
        public abstract Builder collectorExpirationThreshold(Period expirationThreshold);

        public abstract Builder collectorInactiveThreshold(Period inactiveThreshold);

        public abstract Builder collectorUpdateInterval(Period updateInterval);

        public abstract Builder collectorSendStatus(boolean sendStatus);

        public abstract Builder collectorConfigurationOverride(boolean configurationOverride);

        public abstract CollectorSystemConfiguration build();
    }
}