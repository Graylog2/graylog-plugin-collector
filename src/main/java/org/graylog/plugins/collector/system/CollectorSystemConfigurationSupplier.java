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
package org.graylog.plugins.collector.system;

import com.google.common.base.Supplier;
import org.graylog2.plugin.cluster.ClusterConfigService;

import javax.annotation.Nonnull;
import javax.inject.Inject;

public class CollectorSystemConfigurationSupplier implements Supplier<CollectorSystemConfiguration> {
    private final ClusterConfigService clusterConfigService;
    private final CollectorSystemConfiguration config;

    @Inject
    public CollectorSystemConfigurationSupplier(ClusterConfigService clusterConfigService) {
        this.clusterConfigService = clusterConfigService;
        this.config = null;
    }

    public CollectorSystemConfigurationSupplier(@Nonnull CollectorSystemConfiguration config) {
        this.clusterConfigService = null;
        this.config = config;
    }

    @Override
    public CollectorSystemConfiguration get() {
        if (config != null) {
            return config;
        } else if (clusterConfigService != null) {
            return clusterConfigService.getOrDefault(CollectorSystemConfiguration.class,
                    CollectorSystemConfiguration.defaultConfiguration());
        } else {
            throw new IllegalStateException("Neither config nor clusterConfigService are set. This should not happen!");
        }
    }
}
