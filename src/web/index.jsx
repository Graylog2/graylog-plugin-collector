/* eslint-disable import/first */
import packageJson from '../../package.json';
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import SidecarsPage from 'sidecars/SidecarsPage';
import SidecarsStatusPage from 'sidecars/SidecarsStatusPage';
import ConfigurationPage from 'configurations/ConfigurationPage';
import SidecarSystemConfiguration from 'system-configuration/SidecarSystemConfiguration';
import EditConfigurationPage from 'alt-configuration/EditConfigurationPage';
import NewConfigurationPage from 'alt-configuration/NewConfigurationPage';
import AdministrationPage from 'administration/AdministrationPage';
import NewCollectorPage from 'alt-configuration/NewCollectorPage';
import EditCollectorPage from 'alt-configuration/EditCollectorPage';

const manifest = new PluginManifest(packageJson, {
  routes: [
    { path: '/system/sidecars', component: SidecarsPage },
    { path: '/system/sidecars/:id/status', component: SidecarsStatusPage },
    { path: '/system/sidecars/administration', component: AdministrationPage },
    { path: '/system/sidecars/configuration', component: ConfigurationPage },
    { path: '/system/sidecars/configuration/new', component: NewConfigurationPage },
    { path: '/system/sidecars/configuration/edit/:id', component: EditConfigurationPage },
    { path: '/system/sidecars/collector/new', component: NewCollectorPage },
    { path: '/system/sidecars/collector/edit/:id', component: EditCollectorPage },
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
