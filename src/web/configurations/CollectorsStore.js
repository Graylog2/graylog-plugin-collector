import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import UserNotification from 'util/UserNotification';

import CollectorsActions from './CollectorsActions';
import CollectorConfigurationsActions from "./CollectorConfigurationsActions";

const CollectorsStore = Reflux.createStore({
  listenables: [CollectorsActions],
  collectors: undefined,

  getInitialState() {
    return {
      collectors: this.collectors,
    };
  },

  getCollector(collectorId) {
    const promise = fetch('GET', URLUtils.qualifyUrl(`/plugins/org.graylog.plugins.collector/altconfiguration/backends/${collectorId}`));
    promise
      .catch(
        (error) => {
          UserNotification.error(`Fetching collector failed with status: ${error}`,
            'Could not retrieve collector');
        });
    CollectorsActions.getCollector.promise(promise);
  },

  list() {
    const promise = fetch('GET', URLUtils.qualifyUrl('/plugins/org.graylog.plugins.collector/altconfiguration/backends'))
      .then(
        (response) => {
          this.collectors = response.backends;
          this.trigger({ collectors: this.collectors });

          return this.collectors;
        },
        (error) => {
          UserNotification.error(`Fetching sidecar collectors failed with status: ${error}`,
            'Could not retrieve collectors');
        });
    CollectorsActions.list.promise(promise);
  },

  create(collector) {
    const promise = fetch('POST', URLUtils.qualifyUrl('/plugins/org.graylog.plugins.collector/altconfiguration/backends'), collector)
      .then(
        (response) => {
          UserNotification.success('Collector successfully created');
          this.collectors = response.backends;
          this.trigger({ collectors: this.collectors });

          return this.collectors;
        },
        (error) => {
          UserNotification.error(`Fetching sidecar collectors failed with status: ${error}`,
            'Could not retrieve collectors');
        });
    CollectorsActions.list.promise(promise);
  },

  update(collector) {
    const promise = fetch('PUT', URLUtils.qualifyUrl(`/plugins/org.graylog.plugins.collector/altconfiguration/backends/${collector.id}`), collector)
      .then(
        (response) => {
          UserNotification.success('Collector successfully updated');
          this.collectors = response.backends;
          this.trigger({ collectors: this.collectors });

          return this.collectors;
        },
        (error) => {
          UserNotification.error(`Fetching sidecar collectors failed with status: ${error}`,
            'Could not retrieve collectors');
        });
    CollectorsActions.list.promise(promise);
  },

  delete(collector) {
    const url = URLUtils.qualifyUrl(`/plugins/org.graylog.plugins.collector/altconfiguration/backends/${collector.id}`);
    const promise = fetch('DELETE', url);
    promise
      .then((response) => {
        UserNotification.success(`Collector "${collector.name}" successfully deleted`);
        this.list();
        return response;
      }, (error) => {
        UserNotification.error(`Deleting Collector "${collector.name}" failed with status: ${error.message}`,
          'Could not delete Collector');
      });

    CollectorsActions.delete.promise(promise);
  },

  copy(collectorId, name) {
    console.log(`${name} ${collectorId}`);
    const url = URLUtils.qualifyUrl(`/plugins/org.graylog.plugins.collector/altconfiguration/backends/${collectorId}/${name}`);
    const method = 'POST';

    const promise = fetch(method, url);
    promise
      .then((response) => {
        UserNotification.success(`Collector "${collectorId}" successfully copied`);
        this.list();
        return response;
      }, (error) => {
        UserNotification.error(`Saving collector "${name}" failed with status: ${error.message}`,
          'Could not save Collector');
      });

    CollectorsActions.copy.promise(promise);
  },

});

export default CollectorsStore;
