// eslint-disable-next-line no-unused-vars

import packageJson from '../../package.json';
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import SidecarsPage from 'sidecars/SidecarsPage';
import SidecarsStatusPage from 'sidecars/SidecarsStatusPage';
import ConfigurationPage from 'configurations/ConfigurationPage';
import SidecarSystemConfiguration from 'system-configuration/SidecarSystemConfiguration';
import AltConfigurationPage from 'alt-configuration/AltConfigurationPage';
import NewConfigurationPage from 'alt-configuration/NewConfigurationPage';
import AdministrationPage from 'administration/AdministrationPage';
import NewCollectorPage from 'alt-configuration/NewCollectorPage';

const manifest = new PluginManifest(packageJson, {
  routes: [
    { path: '/system/sidecars', component: SidecarsPage },
    { path: '/system/sidecars/:id/status', component: SidecarsStatusPage },
    { path: '/system/sidecars/administration', component: AdministrationPage },
    { path: '/system/sidecars/configuration', component: ConfigurationPage },
    { path: '/system/sidecars/configuration/new', component: NewConfigurationPage },
    { path: '/system/sidecars/configuration/edit/:id', component: AltConfigurationPage },
    { path: '/system/sidecars/collector/new', component: NewCollectorPage },
  ],

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
