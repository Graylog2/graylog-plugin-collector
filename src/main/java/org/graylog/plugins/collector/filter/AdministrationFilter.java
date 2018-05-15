package org.graylog.plugins.collector.filter;

import com.google.inject.name.Named;
import org.graylog.plugins.collector.rest.models.Collector;

import java.util.function.Predicate;

public interface AdministrationFilter extends Predicate<Collector> {
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
