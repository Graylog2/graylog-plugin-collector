import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { Spinner } from 'components/common';
import CollectorList from './CollectorList';

import CollectorsStore from './CollectorsStore';
import CollectorsActions from './CollectorsActions';

const CollectorListContainer = createReactClass({
  mixins: [Reflux.connect(CollectorsStore)],

  componentDidMount() {
    this.loadCollectors();
  },

  loadCollectors() {
    CollectorsActions.list();
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

  _validCollectorName(name) {
    return !this.state.collectors.some((collector) => collector.name === name);
  },

  render() {
    const { collectors } = this.state;
    if (!collectors) {
      return <Spinner />;
    }

    return (
      <CollectorList collectors={collectors}
                     onClone={this.handleClone}
                     onDelete={this.handleDelete}
                     validateCollector={this._validCollectorName} />
    );
  },
});

export default CollectorListContainer;
