package org.graylog.plugins.collector.filter;

import com.google.inject.assistedinject.Assisted;
import org.graylog.plugins.collector.rest.models.Collector;
import org.graylog.plugins.collector.services.CollectorService;
import org.graylog.plugins.collector.rest.models.Sidecar;

import javax.inject.Inject;

public class CollectorAdministrationFilter implements AdministrationFilter {
    private final Collector collector;

    @Inject
    public CollectorAdministrationFilter(CollectorService collectorService,
                                         @Assisted String collectorId) {
        this.collector = collectorService.find(collectorId);
    }

    @Override
    public boolean test(Sidecar sidecar) {
        return collector.nodeOperatingSystem().equalsIgnoreCase(sidecar.nodeDetails().operatingSystem());
    }
}
