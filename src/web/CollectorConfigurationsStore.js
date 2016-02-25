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
        this.trigger({configurations: this.configurations});
    },

    list() {
        const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl));
        promise
            .then(
                response => {
                    this.configurations = response.configurations;
                    this.trigger({configurations: this.configurations});

                    return this.configurations;
                },
                error => {
                    UserNotification.error('Fetching collector configurations failed with status: ' + error,
                        'Could not retrieve configurations');
                });
        CollectorConfigurationsActions.list.promise(promise);
    },

    listTags() {
        const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl + '/' + 'tags'));
        promise
            .then(
                response => {
                    this.configurations = response.configurations;
                    this.trigger({configurations: this.configurations});

                    return this.configurations;
                },
                error => {
                    UserNotification.error('Fetching configuration tags failed with status: ' + error,
                        'Could not retrieve tags');
                });
        CollectorConfigurationsActions.listTags.promise(promise);
    },

    getConfiguration(configurationId) {
        const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl + '/' + configurationId));
        promise
            .catch(
                error => {
                    UserNotification.error('Fetching collector configuration failed with status: ' + error,
                        'Could not retrieve configuration');
                });
        CollectorConfigurationsActions.getConfiguration.promise(promise);
    },

    createConfiguration(name) {
        let url =  URLUtils.qualifyUrl(this.sourceUrl);
        let method = 'POST';
        var configuration = {};
        configuration.name = name;
        configuration.tags = [];
        configuration.inputs = [];
        configuration.outputs = [];
        configuration.snippets = [];

        const promise = fetch(method, url, configuration);
        promise
            .then(() => {
                var message = "Configuration successfully created";
                UserNotification.success(message);
            }, (error) => {
                UserNotification.error("Creating configuration failed with status: " + error.message,
                    "Could not save configuration");
            });

        CollectorConfigurationsActions.createConfiguration.promise(promise);
    },

    saveTags(tags, configurationId) {
        const requestTags = {
            tags: tags,
        };

        let url =  URLUtils.qualifyUrl(this.sourceUrl + '/' + configurationId + '/tags');
        let method = 'PUT';

        const promise = fetch(method, url, requestTags);
        promise
            .then(() => {
                var message = "Configuration tags successfully update to: " + tags;
                UserNotification.success(message);
            }, (error) => {
                UserNotification.error("Saving tags \"" + tags + "\" failed with status: " + error.message,
                    "Could not save configuration tags");
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

        let url =  URLUtils.qualifyUrl(this.sourceUrl + '/' + configurationId + '/outputs');
        let method;
        if (output.id === "") {
            method = 'POST';
        } else {
            requestOutput.output_id = output.id;
            url += '/' + output.id;
            method = 'PUT';
        }

        const promise = fetch(method, url, requestOutput);
        promise
            .then(() => {
                var action = output.id === "" ? "created" : "updated";
                var message = "Configuration output \"" + output.name + "\" successfully " + action;
                UserNotification.success(message);
            }, (error) => {
                UserNotification.error("Saving output \"" + output.name + "\" failed with status: " + error.message,
                    "Could not save Output");
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

        let url =  URLUtils.qualifyUrl(this.sourceUrl + '/' + configurationId + '/inputs');
        let method;
        if (input.id === "") {
            method = 'POST';
        } else {
            requestInput.input_id = input.id;
            url += '/' + input.id;
            method = 'PUT';
        }

        const promise = fetch(method, url, requestInput);
        promise
            .then(() => {
                var action = input.id === "" ? "created" : "updated";
                var message = "Configuration input \"" + input.name + "\" successfully " + action;
                UserNotification.success(message);
            }, (error) => {
                UserNotification.error("Saving input \"" + input.name + "\" failed with status: " + error.message,
                    "Could not save Input");
            });

        CollectorConfigurationsActions.saveInput.promise(promise);
    },

    saveSnippet(snippet, configurationId) {
        const requestSnippet = {
            backend: snippet.backend,
            name: snippet.name,
            snippet: snippet.snippet,
        };

        let url =  URLUtils.qualifyUrl(this.sourceUrl + '/' + configurationId + '/snippets');
        let method;
        if (snippet.id === "") {
            method = 'POST';
        } else {
            requestSnippet.snippet_id = snippet.id;
            url += '/' + snippet.id;
            method = 'PUT';
        }

        const promise = fetch(method, url, requestSnippet);
        promise
            .then(() => {
                var action = snippet.id === "" ? "created" : "updated";
                var message = "Configuration snippet \"" + snippet.name + "\" successfully " + action;
                UserNotification.success(message);
            }, (error) => {
                UserNotification.error("Saving snippet \"" + snippet.name + "\" failed with status: " + error.message,
                    "Could not save Snippet");
            });

        CollectorConfigurationsActions.saveSnippet.promise(promise);
    },

    delete(configuration) {
        let url =  URLUtils.qualifyUrl(this.sourceUrl + '/' + configuration._id);
        const promise = fetch('DELETE', url);
        promise
            .then(() => {
                UserNotification.success("Configuration \"" + configuration.name + "\" successfully deleted");
            }, (error) => {
                UserNotification.error("Deleting Output \"" + configuration.name + "\" failed with status: " + error.message,
                    "Could not delete Configuration");
            });

        CollectorConfigurationsActions.delete.promise(promise);
    },

    deleteOutput(output, configurationId) {
        let url =  URLUtils.qualifyUrl(this.sourceUrl + '/' + configurationId + '/outputs');
        const promise = fetch('DELETE', url + "/" + output.output_id);
        promise
            .then(() => {
                UserNotification.success("Output \"" + output.name + "\" successfully deleted");
            }, (error) => {
                UserNotification.error("Deleting Output \"" + output.name + "\" failed with status: " + error.message,
                    "Could not delete Output");
            });

        CollectorConfigurationsActions.deleteOutput.promise(promise);
    },

    deleteSnippet(snippet, configurationId) {
        let url =  URLUtils.qualifyUrl(this.sourceUrl + '/' + configurationId + '/snippets');
        const promise = fetch('DELETE', url + "/" + snippet.snippet_id);
        promise
            .then(() => {
                UserNotification.success("Snippet \"" + snippet.name + "\" successfully deleted");
            }, (error) => {
                UserNotification.error("Deleting Snippet \"" + snippet.name + "\" failed with status: " + error.message,
                    "Could not delete Snippet");
            });

        CollectorConfigurationsActions.deleteSnippet.promise(promise);
    },

    deleteInput(input, configurationId) {
        let url =  URLUtils.qualifyUrl(this.sourceUrl + '/' + configurationId + '/inputs');
        const promise = fetch('DELETE', url + "/" + input.input_id);
        promise
            .then(() => {
                UserNotification.success("Input \"" + input.name + "\" successfully deleted");
            }, (error) => {
                UserNotification.error("Deleting Input \"" + input.name + "\" failed with status: " + error.message,
                    "Could not delete Input");
            });

        CollectorConfigurationsActions.deleteInput.promise(promise);
    },

    updateTags(tags, configurationId) {
        let url =  URLUtils.qualifyUrl(this.sourceUrl + '/' + configurationId + '/tags');
        const promise = fetch('PUT', url, tags);
        promise
            .then(() => {
                UserNotification.success("Tags successfully updated");
            }, (error) => {
                UserNotification.error("Updating tags failed with status: " + error.message,
                    "Could not update tag");
            });

        CollectorConfigurationsActions.updateTags.promise(promise);
    },

});

export default CollectorConfigurationsStore;