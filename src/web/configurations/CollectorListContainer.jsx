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

  handleCreate() {
    // TODO Implement method
  },

  handleEdit(collector) {
    // TODO Implement method
  },

  handleClone(collector) {
    // TODO Implement method
  },

  handleDelete(collector) {
    CollectorsActions.delete(collector);
  },

  render() {
    const { collectors } = this.state;
    if (!collectors) {
      return <Spinner />;
    }

    return (
      <CollectorList collectors={collectors}
                   onCreate={this.handleCreate}
                   onEdit={this.handleEdit}
                   onClone={this.handleClone}
                   onDelete={this.handleDelete} />
    );
  },
});

export default CollectorListContainer;
