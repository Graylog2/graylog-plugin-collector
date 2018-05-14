import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { Spinner } from 'components/common';
import CollectorList from './CollectorList';

import CollectorsStore from './CollectorsStore';
import CollectorsActions from './CollectorsActions';

const CollectorListContainer = createReactClass({
  mixins: [Reflux.connect(CollectorsStore, 'collectors')],

  componentDidMount() {
    this.loadCollectors();
  },

  loadCollectors() {
    CollectorsActions.list({});
  },

  handleClone(collector, name, callback) {
    CollectorsActions.copy(collector, name)
      .then(() => {
        callback();
      });
  },

  handleDelete(collector) {
    CollectorsActions.delete(collector);
  },

  handlePageChange(page, pageSize) {
    CollectorsActions.list({ page: page, pageSize: pageSize });
  },

  _validCollectorName(name) {
    // TODO: handle this in backend
    return !this.state.collectors.some((collector) => collector.name === name);
  },

  render() {
    const { collectors } = this.state;
    if (!collectors || !collectors.paginatedCollectors) {
      return <Spinner />;
    }

    return (
      <CollectorList collectors={collectors.paginatedCollectors}
                     pagination={collectors.pagination}
                     onPageChange={this.handlePageChange}
                     onClone={this.handleClone}
                     onDelete={this.handleDelete}
                     validateCollector={this._validCollectorName} />
    );
  },
});

export default CollectorListContainer;
