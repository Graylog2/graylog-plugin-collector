// eslint-disable-next-line no-unused-vars

import packageJson from '../../package.json';
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import SidecarsPage from 'sidecars/SidecarsPage';
import SidecarsStatusPage from 'sidecars/SidecarsStatusPage';
import ConfigurationPage from 'configurations/ConfigurationPage';
import SidecarSystemConfiguration from 'system-configuration/SidecarSystemConfiguration';
import AltConfigurationPage from 'alt-configuration/AltConfigurationPage';
import AdministrationPage from 'administration/AdministrationPage';

const manifest = new PluginManifest(packageJson, {
  routes: [
    { path: '/system/sidecars', component: SidecarsPage },
    { path: '/system/sidecars/:id/status', component: SidecarsStatusPage },
    { path: '/system/sidecars/administration', component: AdministrationPage },
    { path: '/system/sidecars/configuration', component: ConfigurationPage },
    { path: '/system/sidecars/configuration/:id', component: AltConfigurationPage },
  ],

  // Adding an element to the top navigation pointing to /sample named "Sample":

  systemnavigation: [
    { path: '/system/sidecars', description: 'Sidecars', permissions: 'collectors:read' },
  ],

  systemConfigurations: [
    {
      component: SidecarSystemConfiguration,
      configType: 'org.graylog.plugins.collector.system.CollectorSystemConfiguration',
    },
  ],
});

PluginStore.register(manifest);
