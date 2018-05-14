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
  mixins: [Reflux.connect(CollectorConfigurationsStore, 'configurations'), Reflux.connect(CollectorsStore, 'collectors')],

  componentDidMount() {
    this._reloadConfiguration();
  },

  _reloadConfiguration() {
    CollectorConfigurationsActions.list({});
    CollectorsActions.all();
  },

  validateConfiguration(name) {
    return CollectorConfigurationsActions.validateConfiguration(name);
  },

  handlePageChange(page, pageSize) {
    const query = this.state.configurations.query;
    CollectorConfigurationsActions.list({ query: query, page: page, pageSize: pageSize });
  },

  handleQueryChange(query = '', callback = () => {}) {
    const pageSize = this.state.configurations.pageSize;
    CollectorConfigurationsActions.list({ query: query, pageSize: pageSize }).finally(callback);
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
    const { collectors, configurations } = this.state;
    const isLoading = !collectors || !collectors.collectors || !configurations || !configurations.configurations;

    if (isLoading) {
      return <Spinner />;
    }

    return (
      <ConfigurationList collectors={collectors.collectors}
                         query={configurations.query}
                         pagination={{ page: configurations.page, pageSize: configurations.pageSize, total: configurations.total }}
                         configurations={configurations.configurations}
                         onPageChange={this.handlePageChange}
                         onQueryChange={this.handleQueryChange}
                         onClone={this.handleClone}
                         onDelete={this.handleDelete}
                         validateConfiguration={this.validateConfiguration} />
    );
  },
});

export default ConfigurationListContainer;
