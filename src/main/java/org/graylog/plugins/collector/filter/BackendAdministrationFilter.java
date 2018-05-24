package org.graylog.plugins.collector.filter;

import com.google.inject.assistedinject.Assisted;
import org.graylog.plugins.collector.services.BackendService;
import org.graylog.plugins.collector.rest.models.Sidecar;
import org.graylog.plugins.collector.rest.models.Backend;

import javax.inject.Inject;

public class BackendAdministrationFilter implements AdministrationFilter {
    private final Backend backend;

    @Inject
    public BackendAdministrationFilter(BackendService backendService,
                                       @Assisted String backendId) {
        this.backend = backendService.find(backendId);
    }

    @Override
    public boolean test(Sidecar sidecar) {
        return backend.nodeOperatingSystem().equalsIgnoreCase(sidecar.nodeDetails().operatingSystem());
    }
}
