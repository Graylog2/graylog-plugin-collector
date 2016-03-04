import packageJson from '../../package.json';
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import CollectorsPage from './CollectorsPage';
import ConfigurationsPage from './ConfigurationsPage';
import CollectorConfiguration from './CollectorConfiguration';
import CollectorSystemConfiguration from './CollectorSystemConfiguration';

PluginStore.register(new PluginManifest(packageJson, {
  routes: [
      { path: '/system/collectors', component: CollectorsPage },
      { path: '/system/collectors/configurations', component: ConfigurationsPage },
      { path: '/system/collectors/configurations/:id', component: CollectorConfiguration}
  ],

  // Adding an element to the top navigation pointing to /sample named "Sample":

  systemnavigation: [
      { path: '/system/collectors', description: 'Collectors' },
  ],

  systemConfigurations: [
    {
      component: CollectorSystemConfiguration,
      configType: 'org.graylog.plugins.collector.system.CollectorSystemConfiguration',
    },
  ],
}));
