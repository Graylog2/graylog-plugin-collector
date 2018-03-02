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

  render() {
    const { backends } = this.state;
    if (!backends) {
      return <Spinner />;
    }

    return <BackendList backends={backends} />;
  },
});

export default BackendListContainer;
