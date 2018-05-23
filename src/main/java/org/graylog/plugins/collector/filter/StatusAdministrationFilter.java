package org.graylog.plugins.collector.filter;

import com.google.inject.assistedinject.Assisted;
import org.graylog.plugins.collector.rest.models.Sidecar;
import org.graylog.plugins.collector.rest.models.CollectorStatusList;

import javax.inject.Inject;

public class StatusAdministrationFilter implements AdministrationFilter {
    private final int status;

    @Inject
    public StatusAdministrationFilter(@Assisted int status) {
        this.status = status;
    }

    @Override
    public boolean test(Sidecar sidecar) {
        final CollectorStatusList collectorStatusList = sidecar.nodeDetails().statusList();
        if (collectorStatusList == null) {
            return false;
        }
        return collectorStatusList.backends().entrySet().stream().anyMatch(entry -> entry.getValue().status() == status);
    }
}
