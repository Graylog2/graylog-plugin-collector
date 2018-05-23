package org.graylog.plugins.collector.filter;

import com.google.inject.name.Named;
import org.graylog.plugins.collector.rest.models.Sidecar;

import java.util.function.Predicate;

public interface AdministrationFilter extends Predicate<Sidecar> {
    enum Type {
        BACKEND, CONFIGURATION, OS, STATUS
    }

    interface Factory {
        @Named("backend") AdministrationFilter createBackendFilter(String backendId);
        @Named("configuration") AdministrationFilter createConfigurationFilter(String configurationId);
        @Named("os") AdministrationFilter createOsFilter(String os);
        @Named("status") AdministrationFilter createStatusFilter(int status);
    }
}
