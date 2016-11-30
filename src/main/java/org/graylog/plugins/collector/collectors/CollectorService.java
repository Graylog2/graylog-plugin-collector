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
}
