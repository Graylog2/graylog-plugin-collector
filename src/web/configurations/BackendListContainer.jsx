import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { Spinner } from 'components/common';
import BackendList from './BackendList';

import CollectorConfigurationsStore from './CollectorConfigurationsStore';
import CollectorConfigurationsActions from './CollectorConfigurationsActions';

const BackendListContainer = createReactClass({
  mixins: [Reflux.connect(CollectorConfigurationsStore)],

  componentDidMount() {
    this.loadBackends();
  },

  loadBackends() {
    CollectorConfigurationsActions.listBackends();
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
