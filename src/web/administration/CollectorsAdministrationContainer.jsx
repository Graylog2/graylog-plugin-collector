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
    SidecarsActions.listPaginated({});
    CollectorConfigurationsActions.list();
  },

  handlePageChange(page, pageSize) {
    const effectivePage = this.state.pagination.pageSize !== pageSize ? 1 : page;
    SidecarsActions.listPaginated({ page: effectivePage, pageSize: pageSize });
  },

  render() {
    const { collectors, sidecars, pagination, configurations } = this.state;
    if (!collectors || !sidecars || !configurations) {
      return <Spinner text="Loading collector list..." />;
    }

    const sidecarCollectors = [];
    sidecars.forEach((sidecar) => {
      const compatibleCollectors = collectors
        .filter(collector => collector.node_operating_system.toLowerCase() === sidecar.node_details.operating_system.toLowerCase());

      if (compatibleCollectors.length === 0) {
        sidecarCollectors.push({ collector: {}, sidecar: sidecar });
      } else {
        compatibleCollectors.forEach((compatibleCollector) => {
          sidecarCollectors.push({ collector: compatibleCollector, sidecar: sidecar });
        });
      }
    });

    return (
      <CollectorsAdministration sidecarCollectors={sidecarCollectors}
                                collectors={collectors}
                                configurations={configurations}
                                pagination={pagination}
                                onPageChange={this.handlePageChange} />
    );
  },
});

export default CollectorsAdministrationContainer;
