package org.graylog.plugins.collector;

import org.graylog.plugins.collector.collectors.CollectorService;
import org.graylog.plugins.collector.collectors.CollectorServiceImpl;
import org.graylog.plugins.collector.collectors.rest.CollectorResource;
import org.graylog.plugins.collector.configurations.CollectorConfigurationService;
import org.graylog.plugins.collector.configurations.rest.resources.CollectorConfigurationResource;
import org.graylog2.plugin.PluginConfigBean;
import org.graylog2.plugin.PluginModule;

import java.util.Collections;
import java.util.Set;

public class CollectorModule extends PluginModule {
    @Override
    public Set<? extends PluginConfigBean> getConfigBeans() {
        return Collections.singleton(new CollectorPluginConfiguration());
    }

    @Override
    protected void configure() {
        bind(CollectorService.class).to(CollectorServiceImpl.class);
        bind(CollectorConfigurationService.class).asEagerSingleton();

        addRestResource(CollectorResource.class);
        addRestResource(CollectorConfigurationResource.class);

        addConfigBeans();
    }
}
