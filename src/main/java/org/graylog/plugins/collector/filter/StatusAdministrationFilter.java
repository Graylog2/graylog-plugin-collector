package org.graylog.plugins.collector.filter;

import com.google.inject.assistedinject.Assisted;
import org.graylog.plugins.collector.rest.models.Collector;
import org.graylog.plugins.collector.rest.models.CollectorStatusList;

import javax.inject.Inject;

public class StatusAdministrationFilter implements AdministrationFilter {
    private final int status;

    @Inject
    public StatusAdministrationFilter(@Assisted int status) {
        this.status = status;
    }

    @Override
    public boolean test(Collector collector) {
        final CollectorStatusList collectorStatusList = collector.nodeDetails().statusList();
        if (collectorStatusList == null) {
            return false;
        }
        return collectorStatusList.backends().entrySet().stream().anyMatch(entry -> entry.getValue().status() == status);
    }
}
