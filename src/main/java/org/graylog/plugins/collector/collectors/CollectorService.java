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

import org.graylog.plugins.collector.collectors.rest.models.CollectorAction;
import org.graylog.plugins.collector.collectors.rest.models.requests.CollectorRegistrationRequest;
import org.joda.time.Period;

import java.util.List;

public interface CollectorService {
    long count();

    Collector save(Collector collector);

    CollectorActions saveAction(CollectorActions collectorActions);

    List<Collector> all();

    Collector findById(String id);

    CollectorActions findActionByCollector(String collectorId, boolean remove);

    List<Collector> findByNodeId(String nodeId);

    int destroy(Collector collector);

    int destroyExpired(Period period);

    Collector fromRequest(String collectorId, CollectorRegistrationRequest request, String collectorVersion);

    CollectorActions actionFromRequest(String collectorId, List<CollectorAction> request);

    CollectorUpload saveUpload(CollectorUpload collectorUpload);
}
