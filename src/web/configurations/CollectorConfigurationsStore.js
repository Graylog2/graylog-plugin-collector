import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';

import CollectorConfigurationsActions from './CollectorConfigurationsActions';

const CollectorConfigurationsStore = Reflux.createStore({
  listenables: [CollectorConfigurationsActions],
  sourceUrl: '/plugins/org.graylog.plugins.collector/configurations',
  configurations: undefined,

  init() {
    this.trigger({ configurations: this.configurations });
  },

  list() {
    const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl))
      .then(
        response => {
          this.configurations = response.configurations;
          this.trigger({ configurations: this.configurations });

          return this.configurations;
        },
        error => {
          UserNotification.error(`Fetching collector configurations failed with status: ${error}`,
            'Could not retrieve configurations');
        });
    CollectorConfigurationsActions.list.promise(promise);
  },

  listTags() {
    const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/tags`));
    promise
      .catch(
        error => {
          UserNotification.error(`Fetching configuration tags failed with status: ${error}`,
            'Could not retrieve tags');
        });
    CollectorConfigurationsActions.listTags.promise(promise);
  },

  getConfiguration(configurationId) {
    const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}`));
    promise
      .catch(
        error => {
          UserNotification.error(`Fetching collector configuration failed with status: ${error}`,
            'Could not retrieve configuration');
        });
    CollectorConfigurationsActions.getConfiguration.promise(promise);
  },

  createConfiguration(name) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}?createDefaults=true`);
    const method = 'POST';
    const configuration = {};
    configuration.name = name;
    configuration.tags = [];
    configuration.inputs = [];
    configuration.outputs = [];
    configuration.snippets = [];

    const promise = fetch(method, url, configuration);
    promise
      .then(() => {
        UserNotification.success('Configuration successfully created');
      }, (error) => {
        UserNotification.error(`Creating configuration failed with status: ${error.message}`,
          'Could not save configuration');
      });

    CollectorConfigurationsActions.createConfiguration.promise(promise);
  },

  updateConfiguration(newConfiguration) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${newConfiguration.id}/name`);

    const configuration = {};
    configuration.id = newConfiguration.id;
    configuration.name = newConfiguration.name;
    configuration.tags = newConfiguration.tags || [];
    configuration.inputs = newConfiguration.inputs || [];
    configuration.outputs = newConfiguration.outputs || [];
    configuration.snippets = newConfiguration.snippets || [];

    const promise = fetch('PUT', url, configuration);
    promise
      .then(() => {
        UserNotification.success('Configuration successfully updated');
      }, (error) => {
        UserNotification.error(`Updating configuration failed with status: ${error.message}`,
          'Could not update configuration');
      });

    CollectorConfigurationsActions.updateConfiguration.promise(promise);
  },

  saveTags(tags, configurationId) {
    const requestTags = { tags };

    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/tags`);
    const method = 'PUT';

    const promise = fetch(method, url, requestTags);
    promise
      .then(() => {
        UserNotification.success(`Configuration tags successfully update to: ${tags}`);
      }, (error) => {
        UserNotification.error(`Saving tags "${tags}" failed with status: ${error.message}`,
          'Could not save configuration tags');
      });

    CollectorConfigurationsActions.saveInput.promise(promise);
  },

  saveOutput(output, configurationId) {
    const requestOutput = {
      backend: output.backend,
      type: output.type,
      name: output.name,
      properties: output.properties,
    };

    let url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/outputs`);
    let method;
    if (output.id === '') {
      method = 'POST';
    } else {
      requestOutput.output_id = output.id;
      url += `/${output.id}`;
      method = 'PUT';
    }

    const promise = fetch(method, url, requestOutput);
    promise
      .then(() => {
        const action = output.id === '' ? 'created' : 'updated';
        UserNotification.success(`Configuration output "${output.name}" successfully ${action}`);
      }, (error) => {
        UserNotification.error(`Saving output "${output.name}" failed with status: ${error.message}`,
          'Could not save Output');
      });

    CollectorConfigurationsActions.saveOutput.promise(promise);
  },

  saveInput(input, configurationId) {
    const requestInput = {
      backend: input.backend,
      type: input.type,
      name: input.name,
      forward_to: input.forwardTo,
      properties: input.properties,
    };

    let url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/inputs`);
    let method;
    if (input.id === '') {
      method = 'POST';
    } else {
      requestInput.input_id = input.id;
      url += `/${input.id}`;
      method = 'PUT';
    }

    const promise = fetch(method, url, requestInput);
    promise
      .then(() => {
        const action = input.id === '' ? 'created' : 'updated';
        UserNotification.success(`Configuration input "${input.name}" successfully ${action}`);
      }, (error) => {
        UserNotification.error(`Saving input "${input.name}" failed with status: ${error.message}`,
          'Could not save Input');
      });

    CollectorConfigurationsActions.saveInput.promise(promise);
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
    let url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/${name}`);
    let method = 'POST';

    const promise = fetch(method, url);
    promise
      .then(() => {
        UserNotification.success(`Configuration "${configurationId}" successfully copied`);
      }, (error) => {
        UserNotification.error(`Saving configuration "${name}" failed with status: ${error.message}`,
          'Could not save Configuration');
      });

    CollectorConfigurationsActions.copyConfiguration.promise(promise);
  },

  copyOutput(outputId, name, configurationId) {
    let url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/outputs/${outputId}/${name}`);
    let method = 'POST';

    const promise = fetch(method, url);
    promise
        .then(() => {
          UserNotification.success(`Configuration output "${outputId}" successfully copied`);
        }, (error) => {
          UserNotification.error(`Saving output "${name}" failed with status: ${error.message}`,
              'Could not save Output');
        });

    CollectorConfigurationsActions.copyOutput.promise(promise);
  },

  copyInput(inputId, name, configurationId) {
    let url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/inputs/${inputId}/${name}`);
    let method = 'POST';

    const promise = fetch(method, url);
    promise
        .then(() => {
          UserNotification.success(`Configuration input "${inputId}" successfully copied`);
        }, (error) => {
          UserNotification.error(`Saving input "${name}" failed with status: ${error.message}`,
              'Could not save Input');
        });

    CollectorConfigurationsActions.copyInput.promise(promise);
  },

  copySnippet(snippetId, name, configurationId) {
    let url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/snippets/${snippetId}/${name}`);
    let method = 'POST';

    const promise = fetch(method, url);
    promise
        .then(() => {
          UserNotification.success(`Configuration snippet "${snippetId}" successfully copied`);
        }, (error) => {
          UserNotification.error(`Saving snippet "${name}" failed with status: ${error.message}`,
              'Could not save Output');
        });

    CollectorConfigurationsActions.copySnippet.promise(promise);
  },

  delete(configuration) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configuration.id}`);
    const promise = fetch('DELETE', url);
    promise
      .then(() => {
        UserNotification.success(`Configuration "${configuration.name}" successfully deleted`);
      }, (error) => {
        UserNotification.error(`Deleting Output "${configuration.name}" failed with status: ${error.message}`,
          'Could not delete Configuration');
      });

    CollectorConfigurationsActions.delete.promise(promise);
  },

  deleteOutput(output, configurationId) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/outputs/${output.output_id}`);
    const promise = fetch('DELETE', url);
    promise
      .then(() => {
        UserNotification.success(`Output "${output.name}" successfully deleted`);
      }, (error) => {
        if (error.additional.status === 412) {
          UserNotification.error(`Deleting Output "${output.name}" failed: Still inputs assigned to it.`);
        } else {
          UserNotification.error(`Deleting Output "${output.name}" failed with status: ${error.message}`,
            'Could not delete Output');
        }
      });

    CollectorConfigurationsActions.deleteOutput.promise(promise);
  },

  deleteSnippet(snippet, configurationId) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/snippets/${snippet.snippet_id}`);
    const promise = fetch('DELETE', url);
    promise
      .then(() => {
        UserNotification.success(`Snippet "${snippet.name}" successfully deleted`);
      }, (error) => {
        UserNotification.error(`Deleting Snippet "${snippet.name}" failed with status: ${error.message}`,
          'Could not delete Snippet');
      });

    CollectorConfigurationsActions.deleteSnippet.promise(promise);
  },

  deleteInput(input, configurationId) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/inputs/${input.input_id}`);
    const promise = fetch('DELETE', url);
    promise
      .then(() => {
        UserNotification.success(`Input "${input.name}" successfully deleted`);
      }, (error) => {
        UserNotification.error(`Deleting Input "${input.name}" failed with status: ${error.message}`,
          'Could not delete Input');
      });

    CollectorConfigurationsActions.deleteInput.promise(promise);
  },

  updateTags(tags, configurationId) {
    const url = URLUtils.qualifyUrl(`${this.sourceUrl}/${configurationId}/tags`);
    const promise = fetch('PUT', url, tags);
    promise
      .then(() => {
        UserNotification.success('Tags successfully updated');
      }, (error) => {
        UserNotification.error(`Updating tags failed with status: ${error.message}`,
          'Could not update tag');
      });

    CollectorConfigurationsActions.updateTags.promise(promise);
  },

});

export default CollectorConfigurationsStore;
