import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';

import CollectorConfigurationsActions from './CollectorConfigurationsActions';

const CollectorConfigurationsStore = Reflux.createStore({
  listenables: [CollectorConfigurationsActions],
  sourceUrl: '/plugins/org.graylog.plugins.collector/altconfiguration',
  configurations: undefined,

  init() {
    this.trigger({ configurations: this.configurations });
  },

  list() {
    const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/configurations`))
      .then(
        (response) => {
          this.configurations = response.configurations;
          this.trigger({ configurations: this.configurations });

          return this.configurations;
        },
        (error) => {
          UserNotification.error(`Fetching collector configurations failed with status: ${error}`,
            'Could not retrieve configurations');
        });
    CollectorConfigurationsActions.list.promise(promise);
  },

  getConfiguration(configurationId) {
    const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/${configurationId}`));
    promise
      .catch(
        (error) => {
          UserNotification.error(`Fetching collector configuration failed with status: ${error}`,
            'Could not retrieve configuration');
        });
    CollectorConfigurationsActions.getConfiguration.promise(promise);
  },

  renderPreview(configurationId) {
    const promise = fetch(
      'GET',
      URLUtils.qualifyUrl(`${this.sourceUrl}/render/preview/${configurationId}`));
    promise
      .catch(
        (error) => {
          UserNotification.error(`Fetching configuration preview failed with status: ${error}`,
            'Could not retrieve preview');
        });
    CollectorConfigurationsActions.renderPreview.promise(promise);
  },

  createConfiguration(name, collectorId) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/configurations`);
    const method = 'POST';
    const configuration = {};
    configuration.name = name;
    configuration.backend_id = collectorId;
    configuration.template = '';

    const promise = fetch(method, url, configuration);
    promise
      .then((response) => {
        UserNotification.success('Configuration successfully created');
        this.list();
        return response;
      }, (error) => {
        UserNotification.error(`Creating configuration failed with status: ${error.message}`,
          'Could not save configuration');
      });

    CollectorConfigurationsActions.createConfiguration.promise(promise);
  },

  updateConfiguration(configuration) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/${configuration.id}`);

    const promise = fetch('PUT', url, configuration);
    promise
      .then((response) => {
        UserNotification.success('Configuration successfully updated');
        this.list();
        return response;
      }, (error) => {
        UserNotification.error(`Updating configuration failed with status: ${error.message}`,
          'Could not update configuration');
      });

    CollectorConfigurationsActions.updateConfiguration.promise(promise);
  },

  copyConfiguration(configurationId, name) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/${name}`);
    const method = 'POST';

    const promise = fetch(method, url);
    promise
      .then((response) => {
        UserNotification.success(`Configuration "${configurationId}" successfully copied`);
        this.list();
        return response;
      }, (error) => {
        UserNotification.error(`Saving configuration "${name}" failed with status: ${error.message}`,
          'Could not save Configuration');
      });

    CollectorConfigurationsActions.copyConfiguration.promise(promise);
  },

  delete(configuration) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configuration.id}`);
    const promise = fetch('DELETE', url);
    promise
      .then((response) => {
        UserNotification.success(`Configuration "${configuration.name}" successfully deleted`);
        this.list();
        return response;
      }, (error) => {
        UserNotification.error(`Deleting Output "${configuration.name}" failed with status: ${error.message}`,
          'Could not delete Configuration');
      });

    CollectorConfigurationsActions.delete.promise(promise);
  },

});

export default CollectorConfigurationsStore;
