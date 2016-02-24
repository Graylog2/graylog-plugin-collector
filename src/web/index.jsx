import packageJson from '../../package.json';
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import CollectorsPage from './CollectorsPage';
import ConfigurationsPage from './ConfigurationsPage';
import CollectorConfiguration from './CollectorConfiguration';

PluginStore.register(new PluginManifest(packageJson, {
  /* This is the place where you define which entities you are providing to the web interface.
     Right now you can add routes and navigation elements to it.

     Examples: */

  // Adding a route to /sample, rendering YourReactComponent when called:

  routes: [
      { path: '/collectors', component: CollectorsPage },
      { path: '/collectors/configurations', component: ConfigurationsPage },
      { path: '/collectors/configurations/:id', component: CollectorConfiguration}
  ],

  // Adding an element to the top navigation pointing to /sample named "Sample":

  navigation: [
      { path: '/collectors', description: 'Collector Manager' },
  ]
}));
