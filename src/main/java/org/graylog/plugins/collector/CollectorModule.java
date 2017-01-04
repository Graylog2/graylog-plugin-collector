/**
 * This file is part of Graylog.
 *
 * Graylog is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.graylog.plugins.collector;

import com.google.common.base.Supplier;
import com.google.common.collect.ImmutableSet;
import com.google.inject.Scopes;
import com.google.inject.TypeLiteral;
import org.graylog.plugins.collector.audit.CollectorAuditEventTypes;
import org.graylog.plugins.collector.collectors.CollectorService;
import org.graylog.plugins.collector.collectors.CollectorServiceImpl;
import org.graylog.plugins.collector.collectors.rest.CollectorResource;
import org.graylog.plugins.collector.common.CollectorPluginConfiguration;
import org.graylog.plugins.collector.configurations.CollectorConfigurationService;
import org.graylog.plugins.collector.configurations.rest.ConfigurationEtagService;
import org.graylog.plugins.collector.configurations.rest.resources.CollectorConfigurationResource;
import org.graylog.plugins.collector.periodical.PurgeExpiredCollectorsThread;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog.plugins.collector.system.CollectorSystemConfiguration;
import org.graylog.plugins.collector.system.CollectorSystemConfigurationSupplier;
import org.graylog2.plugin.PluginConfigBean;
import org.graylog2.plugin.PluginModule;

import java.util.Set;

public class CollectorModule extends PluginModule {
    @Override
    public Set<? extends PluginConfigBean> getConfigBeans() {
        return ImmutableSet.of(
                new CollectorPluginConfiguration()
        );
    }

    @Override
    protected void configure() {
        bind(CollectorService.class).to(CollectorServiceImpl.class);
        bind(CollectorConfigurationService.class).asEagerSingleton();
        bind(new TypeLiteral<Supplier<CollectorSystemConfiguration>>(){}).to(CollectorSystemConfigurationSupplier.class);

        addPeriodical(PurgeExpiredCollectorsThread.class);
        addRestResource(CollectorResource.class);
        addRestResource(CollectorConfigurationResource.class);
        addPermissions(CollectorRestPermissions.class);

        addAuditEventTypes(CollectorAuditEventTypes.class);

        serviceBinder().addBinding().to(ConfigurationEtagService.class).in(Scopes.SINGLETON);
    }
}
