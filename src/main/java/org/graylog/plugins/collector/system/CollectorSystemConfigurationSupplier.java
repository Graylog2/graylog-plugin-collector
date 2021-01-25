/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
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
