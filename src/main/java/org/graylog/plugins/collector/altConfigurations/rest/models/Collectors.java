package org.graylog.plugins.collector.altConfigurations.rest.models;

import com.google.common.base.Function;
import com.google.common.collect.Lists;

import java.util.List;

public class Collectors {
    public static List<CollectorSummary> toSummaryList(List<Collector> collectors, Function<Collector, Boolean> isActiveFunction) {
        final List<CollectorSummary> collectorSummaries = Lists.newArrayListWithCapacity(collectors.size());
        for (Collector collector : collectors)
            collectorSummaries.add(collector.toSummary(isActiveFunction));

        return collectorSummaries;
    }
}
