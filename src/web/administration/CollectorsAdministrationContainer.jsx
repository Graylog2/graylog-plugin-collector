import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { Spinner } from 'components/common';
import CollectorsAdministration from './CollectorsAdministration';

import CollectorsActions from '../configurations/CollectorsActions';
import CollectorsStore from '../configurations/CollectorsStore';
import SidecarsActions from '../sidecars/SidecarsActions';
import SidecarsStore from '../sidecars/SidecarsStore';
import CollectorConfigurationsActions from '../configurations/CollectorConfigurationsActions';
import CollectorConfigurationsStore from '../configurations/CollectorConfigurationsStore';

const CollectorsAdministrationContainer = createReactClass({
  mixins: [Reflux.connect(CollectorsStore), Reflux.connect(SidecarsStore), Reflux.connect(CollectorConfigurationsStore)],

  componentDidMount() {
    this.loadData();
  },

  loadData() {
    CollectorsActions.list();
    SidecarsActions.list();
    CollectorConfigurationsActions.list();
  },

  render() {
    const { collectors, sidecars, configurations } = this.state;
    if (!collectors || !sidecars || !configurations) {
      return <Spinner text="Loading collector list..." />;
    }

    const sidecarCollectors = [];
    sidecars.forEach((sidecar) => {
      const collectorNames = collectors
        .filter(collector => collector.node_operating_system.toLowerCase() === sidecar.node_details.operating_system.toLowerCase())
        .map(collector => collector.name);
      collectorNames.forEach((collectorName) => {
        sidecarCollectors.push({ collector: collectorName, sidecar: sidecar });
      });
    });

    return (
      <CollectorsAdministration sidecarCollectors={sidecarCollectors}
                                collectors={collectors}
                                configurations={configurations} />
    );
  },
});

export default CollectorsAdministrationContainer;
