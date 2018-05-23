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
import com.google.inject.assistedinject.FactoryModuleBuilder;
import com.google.inject.multibindings.Multibinder;
import com.google.inject.name.Names;
import org.graylog.plugins.collector.periodical.PurgeExpiredCollectorsThread;
import org.graylog.plugins.collector.services.CollectorService;
import org.graylog.plugins.collector.services.ConfigurationService;
import org.graylog.plugins.collector.services.BackendService;
import org.graylog.plugins.collector.services.EtagService;
import org.graylog.plugins.collector.filter.AdministrationFilter;
import org.graylog.plugins.collector.filter.BackendAdministrationFilter;
import org.graylog.plugins.collector.filter.ConfigurationAdministrationFilter;
import org.graylog.plugins.collector.filter.OsAdministrationFilter;
import org.graylog.plugins.collector.filter.StatusAdministrationFilter;
import org.graylog.plugins.collector.migrations.V20180212165000_AddDefaultBackends;
import org.graylog.plugins.collector.migrations.V20180323150000_AddSidecarUser;
import org.graylog.plugins.collector.rest.resources.ActionResource;
import org.graylog.plugins.collector.rest.resources.AdministrationResource;
import org.graylog.plugins.collector.rest.resources.SidecarResource;
import org.graylog.plugins.collector.rest.resources.ConfigurationResource;
import org.graylog.plugins.collector.rest.resources.BackendResource;
import org.graylog.plugins.collector.audit.CollectorAuditEventTypes;
import org.graylog.plugins.collector.common.CollectorPluginConfiguration;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog.plugins.collector.system.CollectorSystemConfiguration;
import org.graylog.plugins.collector.system.CollectorSystemConfigurationSupplier;
import org.graylog2.migrations.Migration;
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
        bind(ConfigurationService.class).asEagerSingleton();
        bind(CollectorService.class).asEagerSingleton();
        bind(BackendService.class).asEagerSingleton();
        bind(new TypeLiteral<Supplier<CollectorSystemConfiguration>>(){}).to(CollectorSystemConfigurationSupplier.class);

        install(new FactoryModuleBuilder()
                .implement(AdministrationFilter.class, Names.named("backend"), BackendAdministrationFilter.class)
                .implement(AdministrationFilter.class, Names.named("configuration"), ConfigurationAdministrationFilter.class)
                .implement(AdministrationFilter.class, Names.named("os"), OsAdministrationFilter.class)
                .implement(AdministrationFilter.class, Names.named("status"), StatusAdministrationFilter.class)
                .build(AdministrationFilter.Factory.class));

        addRestResource(ConfigurationResource.class);
        addRestResource(BackendResource.class);
        addRestResource(ActionResource.class);
        addRestResource(AdministrationResource.class);
        addRestResource(SidecarResource.class);
        addPermissions(CollectorRestPermissions.class);
        addPeriodical(PurgeExpiredCollectorsThread.class);

        addAuditEventTypes(CollectorAuditEventTypes.class);

        final Multibinder<Migration> binder = Multibinder.newSetBinder(binder(), Migration.class);
        binder.addBinding().to(V20180212165000_AddDefaultBackends.class);
        binder.addBinding().to(V20180323150000_AddSidecarUser.class);

        serviceBinder().addBinding().to(EtagService.class).in(Scopes.SINGLETON);
    }
}
