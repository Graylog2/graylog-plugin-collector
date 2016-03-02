package org.graylog.plugins.collector;

import org.graylog.plugins.collector.collectors.CollectorService;
import org.graylog.plugins.collector.collectors.CollectorServiceImpl;
import org.graylog.plugins.collector.collectors.rest.CollectorResource;
import org.graylog.plugins.collector.configurations.CollectorConfigurationService;
import org.graylog.plugins.collector.configurations.rest.resources.CollectorConfigurationResource;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog2.plugin.PluginModule;

public class CollectorModule extends PluginModule {
    @Override
    protected void configure() {
        bind(CollectorService.class).to(CollectorServiceImpl.class);
        bind(CollectorConfigurationService.class).asEagerSingleton();

        addRestResource(CollectorResource.class);
        addRestResource(CollectorConfigurationResource.class);
        addPermissions(CollectorRestPermissions.class);

        addConfigBeans();
    }
}
