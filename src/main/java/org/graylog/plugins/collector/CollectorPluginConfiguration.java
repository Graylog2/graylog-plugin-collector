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
package org.graylog.plugins.collector;

import com.github.joschi.jadconfig.Parameter;
import com.github.joschi.jadconfig.util.Duration;
import com.github.joschi.jadconfig.validators.PositiveDurationValidator;
import org.graylog2.plugin.PluginConfigBean;

public class CollectorPluginConfiguration implements PluginConfigBean {
    @Parameter(value = "collector_expiration_threshold", validator = PositiveDurationValidator.class)
    private Duration collectorExpirationThreshold = Duration.days(14);

    @Parameter(value = "collector_inactive_threshold", validator = PositiveDurationValidator.class)
    private Duration collectorInactiveThreshold = Duration.minutes(1);

    public Duration getCollectorExpirationThreshold() {
        return collectorExpirationThreshold;
    }

    public Duration getCollectorInactiveThreshold() {
        return collectorInactiveThreshold;
    }
}
