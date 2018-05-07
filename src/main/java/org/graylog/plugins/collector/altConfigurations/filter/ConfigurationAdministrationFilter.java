package org.graylog.plugins.collector.altConfigurations.filter;

import com.google.inject.assistedinject.Assisted;
import org.graylog.plugins.collector.altConfigurations.rest.models.Collector;
import org.graylog.plugins.collector.altConfigurations.rest.requests.ConfigurationAssignment;

import javax.inject.Inject;
import java.util.List;

public class ConfigurationAdministrationFilter implements AdministrationFilter {
    private final String configurationId;

    @Inject
    public ConfigurationAdministrationFilter(@Assisted String configurationId) {
        this.configurationId = configurationId;
    }

    @Override
    public boolean test(Collector collector) {
        final List<ConfigurationAssignment> assignments = collector.assignments();
        if (assignments == null) {
            return false;
        }
        return assignments.stream().anyMatch(assignment -> assignment.configurationId().equals(configurationId));
    }
}
