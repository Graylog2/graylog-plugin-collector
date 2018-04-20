import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import UserNotification from 'util/UserNotification';

import CollectorsActions from './CollectorsActions';

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
    console.log(collector);
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

});

export default CollectorsStore;
