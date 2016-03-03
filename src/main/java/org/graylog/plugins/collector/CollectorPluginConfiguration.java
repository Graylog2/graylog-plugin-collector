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
