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
// eslint-disable-next-line no-unused-vars
import './webpack-entry';

import AppConfig from 'util/AppConfig';
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import CollectorsPage from 'collectors/CollectorsPage';
import CollectorsStatusPage from 'collectors/CollectorsStatusPage';
import ConfigurationsPage from 'configurations/ConfigurationsPage';
import CollectorConfigurationPage from 'collector-configuration/CollectorConfigurationPage';
import CollectorSystemConfiguration from 'system-configuration/CollectorSystemConfiguration';
import packageJson from '../../package.json';

const manifest = AppConfig.isCloud() ? {} :  new PluginManifest(packageJson, {
  routes:  [
    { path: '/system/collectors', component: CollectorsPage },
    { path: '/system/collectors/:id/status', component: CollectorsStatusPage },
    { path: '/system/collectors/configurations', component: ConfigurationsPage },
    { path: '/system/collectors/configurations/:id', component: CollectorConfigurationPage },
  ],

  // Adding an element to the top navigation pointing to /sample named "Sample":

  systemnavigation: [
    { path: '/system/collectors', description: 'Collectors (legacy)', permissions: 'collectors:read' },
  ],

  systemConfigurations: [
    {
      component: CollectorSystemConfiguration,
      configType: 'org.graylog.plugins.collector.system.CollectorSystemConfiguration',
    },
  ],
});

PluginStore.register(manifest);
