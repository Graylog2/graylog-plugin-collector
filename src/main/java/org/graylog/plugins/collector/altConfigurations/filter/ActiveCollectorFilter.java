package org.graylog.plugins.collector.altConfigurations.filter;

import org.graylog.plugins.collector.altConfigurations.rest.models.Collector;
import org.joda.time.DateTime;
import org.joda.time.Period;

import java.util.function.Predicate;

public class ActiveCollectorFilter implements Predicate<Collector> {
    private final Period timeoutPeriod;

    public ActiveCollectorFilter(Period timeoutPeriod) {
        this.timeoutPeriod = timeoutPeriod;
    }

    @Override
    public boolean test(Collector collector) {
        final DateTime threshold = DateTime.now().minus(timeoutPeriod);
        return collector.lastSeen().isAfter(threshold);
    }
}
