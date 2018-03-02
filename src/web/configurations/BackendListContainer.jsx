import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { Spinner } from 'components/common';
import BackendList from './BackendList';

import BackendsStore from './BackendsStore';
import BackendsActions from './BackendsActions';

const BackendListContainer = createReactClass({
  mixins: [Reflux.connect(BackendsStore)],

  componentDidMount() {
    this.loadBackends();
  },

  loadBackends() {
    BackendsActions.list();
  },

  handleCreate() {
    // TODO Implement method
  },

  handleEdit(backend) {
    // TODO Implement method
  },

  handleClone(backend) {
    // TODO Implement method
  },

  handleDelete(backend) {
    // TODO Implement method
  },

  render() {
    const { backends } = this.state;
    if (!backends) {
      return <Spinner />;
    }

    return (
      <BackendList backends={backends}
                   onCreate={this.handleCreate}
                   onEdit={this.handleEdit}
                   onClone={this.handleClone}
                   onDelete={this.handleDelete}/>
    );
  },
});

export default BackendListContainer;
