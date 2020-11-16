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
package org.graylog.plugins.collector.collectors;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorSummary;

import java.util.List;

public class Collectors {
    public static List<CollectorSummary> toSummaryList(List<Collector> collectors, Function<Collector, Boolean> isActiveFunction) {
        final List<CollectorSummary> collectorSummaries = Lists.newArrayListWithCapacity(collectors.size());
        for (Collector collector : collectors)
            collectorSummaries.add(collector.toSummary(isActiveFunction));

        return collectorSummaries;
    }
}
