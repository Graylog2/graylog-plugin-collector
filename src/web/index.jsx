// eslint-disable-next-line no-unused-vars
import webpackEntry from 'webpack-entry';

import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import CollectorsPage from 'collectors/CollectorsPage';
import CollectorsStatusPage from 'collectors/CollectorsStatusPage';
import ConfigurationsPage from 'configurations/ConfigurationsPage';
import CollectorConfigurationPage from 'collector-configuration/CollectorConfigurationPage';
import CollectorSystemConfiguration from 'system-configuration/CollectorSystemConfiguration';
import packageJson from '../../package.json';

const manifest = new PluginManifest(packageJson, {
  routes: [
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
