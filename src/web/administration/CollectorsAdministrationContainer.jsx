import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { Spinner } from 'components/common';
import CollectorsAdministration from './CollectorsAdministration';

import BackendsActions from '../configurations/BackendsActions';
import BackendsStore from '../configurations/BackendsStore';
import CollectorsActions from '../collectors/CollectorsActions';
import CollectorsStore from '../collectors/CollectorsStore';


const CollectorsAdministrationContainer = createReactClass({
  mixins: [Reflux.connect(BackendsStore), Reflux.connect(CollectorsStore)],

  componentDidMount() {
    this.loadData();
  },

  loadData() {
    BackendsActions.list();
    CollectorsActions.list();
  },

  render() {
    const { backends, collectors } = this.state;
    if (!backends || !collectors) {
      return <Spinner text="Loading collector list..." />;
    }

    const collectorsByBackend = [];
    collectors.forEach((collector) => {
      const backendNames = backends
        .filter(backend => backend.node_operating_system.toLowerCase() === collector.node_details.operating_system.toLowerCase())
        .map(backend => backend.name);
      backendNames.forEach((backend) => {
        collectorsByBackend.push({ backend: backend, collector: collector });
      });
    });

    return <CollectorsAdministration collectorsByBackend={collectorsByBackend} backends={backends} />;
  },
});

export default CollectorsAdministrationContainer;
