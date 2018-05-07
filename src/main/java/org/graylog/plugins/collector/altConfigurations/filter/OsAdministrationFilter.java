package org.graylog.plugins.collector.altConfigurations.filter;

import com.google.inject.assistedinject.Assisted;
import org.graylog.plugins.collector.altConfigurations.rest.models.Collector;

import javax.inject.Inject;

public class OsAdministrationFilter implements AdministrationFilter {
    private final String os;

    @Inject
    public OsAdministrationFilter(@Assisted String os) {
        this.os = os;
    }

    @Override
    public boolean test(Collector collector) {
        return collector.nodeDetails().operatingSystem().equalsIgnoreCase(os);
    }
}
