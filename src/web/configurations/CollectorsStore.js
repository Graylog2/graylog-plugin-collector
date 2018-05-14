import Reflux from 'reflux';
import URI from 'urijs';

import URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import UserNotification from 'util/UserNotification';

import CollectorsActions from './CollectorsActions';

const CollectorsStore = Reflux.createStore({
  listenables: [CollectorsActions],
  collectors: undefined,
  query: undefined,
  pagination: {
    page: undefined,
    pageSize: undefined,
    total: undefined,
  },
  paginatedCollectors: undefined,

  getInitialState() {
    return {
      collectors: this.collectors,
    };
  },

  propagateChanges() {
    this.trigger({
      collectors: this.collectors,
      paginatedCollectors: this.paginatedCollectors,
      query: this.query,
      pagination: this.pagination,
    });
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

  _fetchCollectors({ query, page, pageSize }) {
    const search = {
      query: query,
      page: page,
      per_page: pageSize,
    };

    const uri = URI('/plugins/org.graylog.plugins.collector/altconfiguration/backends/summary').search(search).toString();

    return fetch('GET', URLUtils.qualifyUrl(uri));
  },

  all() {
    const promise = this._fetchCollectors({ pageSize: 0 })
      .then(
        (response) => {
          this.collectors = response.backends;
          this.propagateChanges();
          return response.backends;
        },
        (error) => {
          UserNotification.error(`Fetching sidecar collectors failed with status: ${error}`,
            'Could not retrieve collectors');
        });

    CollectorsActions.all.promise(promise);
  },

  list({ query = '', page = 1, pageSize = 10 }) {
    const promise = this._fetchCollectors({ query: query, page: page, pageSize: pageSize })
      .then(
        (response) => {
          this.query = response.query;
          this.pagination = {
            page: response.page,
            pageSize: response.per_page,
            total: response.total,
          };
          this.paginatedCollectors = response.backends;

          this.propagateChanges();
          return response.backends;
        },
        (error) => {
          UserNotification.error(`Fetching sidecar collectors failed with status: ${error}`,
            'Could not retrieve collectors');
        });

    CollectorsActions.list.promise(promise);
  },

  refreshList() {
    this.list({ query: this.query, page: this.pagination.page, pageSize: this.pagination.pageSize });
  },

  create(collector) {
    const promise = fetch('POST', URLUtils.qualifyUrl('/plugins/org.graylog.plugins.collector/altconfiguration/backends'), collector)
      .then(
        (response) => {
          UserNotification.success('Collector successfully created');
          this.collectors = response.backends;
          this.propagateChanges();

          return this.collectors;
        },
        (error) => {
          UserNotification.error(`Fetching sidecar collectors failed with status: ${error}`,
            'Could not retrieve collectors');
        });
    CollectorsActions.create.promise(promise);
  },

  update(collector) {
    const promise = fetch('PUT', URLUtils.qualifyUrl(`/plugins/org.graylog.plugins.collector/altconfiguration/backends/${collector.id}`), collector)
      .then(
        (response) => {
          UserNotification.success('Collector successfully updated');
          this.collectors = response.backends;
          this.propagateChanges();

          return this.collectors;
        },
        (error) => {
          UserNotification.error(`Fetching sidecar collectors failed with status: ${error}`,
            'Could not retrieve collectors');
        });
    CollectorsActions.update.promise(promise);
  },

  delete(collector) {
    const url = URLUtils.qualifyUrl(`/plugins/org.graylog.plugins.collector/altconfiguration/backends/${collector.id}`);
    const promise = fetch('DELETE', url);
    promise
      .then((response) => {
        UserNotification.success(`Collector "${collector.name}" successfully deleted`);
        this.refreshList();
        return response;
      }, (error) => {
        UserNotification.error(`Deleting Collector "${collector.name}" failed with status: ${error.message}`,
          'Could not delete Collector');
      });

    CollectorsActions.delete.promise(promise);
  },

  copy(collectorId, name) {
    const url = URLUtils.qualifyUrl(`/plugins/org.graylog.plugins.collector/altconfiguration/backends/${collectorId}/${name}`);
    const method = 'POST';

    const promise = fetch(method, url);
    promise
      .then((response) => {
        UserNotification.success(`Collector "${collectorId}" successfully copied`);
        this.refreshList();
        return response;
      }, (error) => {
        UserNotification.error(`Saving collector "${name}" failed with status: ${error.message}`,
          'Could not save Collector');
      });

    CollectorsActions.copy.promise(promise);
  },

});

export default CollectorsStore;
