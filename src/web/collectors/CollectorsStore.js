import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch, { fetchPeriodically } from 'logic/rest/FetchProvider';

import CollectorsActions from './CollectorsActions';

const CollectorsStore = Reflux.createStore({
  listenables: [CollectorsActions],
  sourceUrl: '/plugins/org.graylog.plugins.collector/collectors',
  collectors: undefined,

  init() {
    this.trigger({ collectors: this.collectors });
  },

  list() {
    const promise = fetchPeriodically('GET', URLUtils.qualifyUrl(this.sourceUrl));
    promise
      .then(
        response => {
          this.collectors = response.collectors;
          this.trigger({ collectors: this.collectors });

          return this.collectors;
        },
        error => {
          UserNotification.error(`Fetching Collectors failed with status: ${error}`,
            'Could not retrieve Collectors');
        });
    CollectorsActions.list.promise(promise);
  },

  getCollector(collectorId) {
    const promise = fetchPeriodically('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${collectorId}`));
    promise
      .catch(
        error => {
          UserNotification.error(`Fetching Collector failed with status: ${error}`,
            'Could not retrieve Collector');
        });
    CollectorsActions.getCollector.promise(promise);
  },

  restartCollectorBackend(collectorId, backend) {
    const action = {};
    action.backend = backend;
    action.properties = {};
    action.properties.restart = true;
    const promise = fetch('PUT', URLUtils.qualifyUrl(`${this.sourceUrl}/${collectorId}/action`), [action]);
    promise
      .catch(
        error => {
          UserNotification.error(`Restarting Collector failed with status: ${error}`,
            'Could not restart Collector');
        });
    CollectorsActions.restartCollectorBackend.promise(promise);
  },

  getCollectorActions(collectorId) {
    const promise = fetchPeriodically('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${collectorId}/action`));
    promise
      .catch(
        error => {
          UserNotification.error(`Fetching Collector actions failed with status: ${error}`,
            'Could not retrieve Collector actions');
        });
    CollectorsActions.getCollectorActions.promise(promise);
  },
});

export default CollectorsStore;
