import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { Spinner } from 'components/common';

import ConfigurationList from './ConfigurationList';

import CollectorConfigurationsStore from './CollectorConfigurationsStore';
import CollectorsStore from './CollectorsStore';
import CollectorsActions from './CollectorsActions';
import CollectorConfigurationsActions from './CollectorConfigurationsActions';

const ConfigurationListContainer = createReactClass({
  mixins: [Reflux.connect(CollectorConfigurationsStore), Reflux.connect(CollectorsStore)],

  componentDidMount() {
    this._reloadConfiguration();
  },

  _reloadConfiguration() {
    CollectorConfigurationsActions.list({});
    CollectorsActions.list();
  },

  validateConfiguration(name) {
    return CollectorConfigurationsActions.validateConfiguration(name);
  },

  handlePageChange(page, pageSize) {
    CollectorConfigurationsActions.list({ query: this.state.query, page: page, pageSize: pageSize });
  },

  handleQueryChange(query = '', callback = () => {}) {
    CollectorConfigurationsActions.list({ query: query, pageSize: this.state.pageSize }).finally(callback);
  },

  handleClone(configuration, name, callback) {
    CollectorConfigurationsActions.copyConfiguration(configuration, name)
      .then(() => {
        callback();
      });
  },

  handleDelete(configuration) {
    CollectorConfigurationsActions.delete(configuration);
  },

  render() {
    const { collectors, configurations, query, page, pageSize, total } = this.state;
    const isLoading = !collectors || !configurations;

    if (isLoading) {
      return <Spinner />;
    }

    return (
      <ConfigurationList collectors={collectors}
                         query={query}
                         pagination={{ page: page, pageSize: pageSize, total: total }}
                         configurations={configurations}
                         onPageChange={this.handlePageChange}
                         onQueryChange={this.handleQueryChange}
                         onClone={this.handleClone}
                         onDelete={this.handleDelete}
                         validateConfiguration={this.validateConfiguration} />
    );
  },
});

export default ConfigurationListContainer;
