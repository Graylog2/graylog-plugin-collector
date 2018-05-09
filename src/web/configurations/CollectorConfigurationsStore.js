import Reflux from 'reflux';
import URI from 'urijs';

import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';

import CollectorConfigurationsActions from './CollectorConfigurationsActions';

const CollectorConfigurationsStore = Reflux.createStore({
  listenables: [CollectorConfigurationsActions],
  sourceUrl: '/plugins/org.graylog.plugins.collector/altconfiguration',

  list({ query = '', page = 1, pageSize = 10 }) {
    const baseUrl = `${this.sourceUrl}/configurations`;
    const search = {
      query: query,
      page: page,
      per_page: pageSize,
    };

    const uri = URI(baseUrl).search(search).toString();

    const promise = fetch('GET', URLUtils.qualifyUrl(uri))
      .then(
        (response) => {
          this.trigger({
            configurations: response.configurations,
            query: response.query,
            page: response.page,
            pageSize: response.pageSize,
            total: response.total,
          });
          return response.configurations;
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

  renderPreview(template) {
    const requestTemplate = {
      template: template,
    };

    const promise = fetch(
      'POST',
      URLUtils.qualifyUrl(`${this.sourceUrl}/render/preview`),
      requestTemplate);
    promise
      .catch(
        (error) => {
          UserNotification.error(`Fetching configuration preview failed with status: ${error}`,
            'Could not retrieve preview');
        });
    CollectorConfigurationsActions.renderPreview.promise(promise);
  },

  createConfiguration(configuration) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/configurations`);
    const method = 'POST';

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

  saveSnippet(snippet, configurationId) {
    const requestSnippet = {
      backend: snippet.backend,
      name: snippet.name,
      snippet: snippet.snippet,
    };

    let url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/snippets`);
    let method;
    if (snippet.id === '') {
      method = 'POST';
    } else {
      requestSnippet.snippet_id = snippet.id;
      url += `/${snippet.id}`;
      method = 'PUT';
    }

    const promise = fetch(method, url, requestSnippet);
    promise
      .then(() => {
        var action = snippet.id === '' ? 'created' : 'updated';
        UserNotification.success(`Configuration snippet "${snippet.name}" successfully ${action}`);
      }, (error) => {
        UserNotification.error(`Saving snippet "${snippet.name}" failed with status: ${error.message}`,
          'Could not save Snippet');
      });

    CollectorConfigurationsActions.saveSnippet.promise(promise);
  },

  copyConfiguration(configurationId, name) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/${configurationId}/${name}`);
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
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/configurations/${configuration.id}`);
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
