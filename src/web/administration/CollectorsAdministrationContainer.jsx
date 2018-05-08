import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import lodash from 'lodash';
import { naturalSortIgnoreCase } from 'util/SortUtils';

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
    SidecarsActions.listAdministration({});
    CollectorConfigurationsActions.list();
  },

  handlePageChange(page, pageSize) {
    const effectivePage = this.state.pagination.pageSize !== pageSize ? 1 : page;
    SidecarsActions.listAdministration({ page: effectivePage, pageSize: pageSize });
  },

  handleFilter(property, value) {
    const filters = {};
    filters[property] = value;
    SidecarsActions.listAdministration({ filters: filters });
  },

  render() {
    const { collectors, sidecars, pagination, configurations } = this.state;
    if (!collectors || !sidecars || !configurations) {
      return <Spinner text="Loading collector list..." />;
    }

    const sidecarCollectors = [];
    sidecars
      .sort((s1, s2) => naturalSortIgnoreCase(s1.node_name, s2.node_name))
      .forEach((sidecar) => {
        const compatibleCollectorIds = sidecar.backends;
        if (lodash.isEmpty(compatibleCollectorIds)) {
          sidecarCollectors.push({ collector: {}, sidecar: sidecar });
          return;
        }

        compatibleCollectorIds
          .map(id => lodash.find(collectors, { id: id }))
          .forEach((compatibleCollector) => {
            sidecarCollectors.push({ collector: compatibleCollector, sidecar: sidecar });
          });
      });

    return (
      <CollectorsAdministration sidecarCollectorPairs={sidecarCollectors}
                                collectors={collectors}
                                configurations={configurations}
                                pagination={pagination}
                                onPageChange={this.handlePageChange}
                                onFilter={this.handleFilter} />
    );
  },
});

export default CollectorsAdministrationContainer;
