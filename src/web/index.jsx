// eslint-disable-next-line no-unused-vars

import packageJson from '../../package.json';
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import CollectorsPage from 'collectors/CollectorsPage';
import CollectorsStatusPage from 'collectors/CollectorsStatusPage';
import ConfigurationPage from 'configurations/ConfigurationPage';
import CollectorConfigurationPage from 'collector-configuration/CollectorConfigurationPage';
import CollectorSystemConfiguration from 'system-configuration/CollectorSystemConfiguration';
import AltConfigurationPage from 'alt-configuration/AltConfigurationPage';
import AdministrationPage from 'administration/AdministrationPage';

const manifest = new PluginManifest(packageJson, {
  routes: [
    { path: '/system/collectors', component: CollectorsPage },
    { path: '/system/collectors/:id/status', component: CollectorsStatusPage },
    { path: '/system/collectors/administration', component: AdministrationPage },
    { path: '/system/collectors/configuration', component: ConfigurationPage },
    { path: '/system/collectors/configuration/:id', component: CollectorConfigurationPage },
    { path: '/system/collectors/altconfiguration/:id', component: AltConfigurationPage },
  ],

  // Adding an element to the top navigation pointing to /sample named "Sample":

  systemnavigation: [
    { path: '/system/collectors', description: 'Collectors', permissions: 'collectors:read' },
  ],

  systemConfigurations: [
    {
      component: CollectorSystemConfiguration,
      configType: 'org.graylog.plugins.collector.system.CollectorSystemConfiguration',
    },
  ],
});

PluginStore.register(manifest);
