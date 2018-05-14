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
  mixins: [Reflux.connect(CollectorsStore, 'collectors'), Reflux.connect(SidecarsStore, 'sidecars'), Reflux.connect(CollectorConfigurationsStore, 'configurations')],

  componentDidMount() {
    this.loadData();
  },

  loadData() {
    CollectorsActions.all();
    SidecarsActions.listAdministration({});
    CollectorConfigurationsActions.all();
  },

  handlePageChange(page, pageSize) {
    const { filters, pagination, query } = this.state.sidecars;
    const effectivePage = pagination.pageSize !== pageSize ? 1 : page;
    SidecarsActions.listAdministration({ query: query, filters: filters, page: effectivePage, pageSize: pageSize });
  },

  handleFilter(property, value) {
    const { filters, pagination, query } = this.state.sidecars;
    const newFilters = lodash.cloneDeep(filters);
    newFilters[property] = value;
    SidecarsActions.listAdministration({ query: query, filters: newFilters, pageSize: pagination.pageSize });
  },

  handleQueryChange(query = '', callback = () => {}) {
    const { filters, pagination } = this.state.sidecars;
    SidecarsActions.listAdministration({ query: query, filters: filters, pageSize: pagination.pageSize }).finally(callback);
  },

  render() {
    const { collectors, configurations, sidecars } = this.state;
    if (!collectors || !collectors.collectors || !sidecars || !sidecars.sidecars || !configurations || !configurations.configurations) {
      return <Spinner text="Loading collector list..." />;
    }

    const sidecarCollectors = [];
    sidecars.sidecars
      .sort((s1, s2) => naturalSortIgnoreCase(s1.node_name, s2.node_name))
      .forEach((sidecar) => {
        const compatibleCollectorIds = sidecar.backends;
        if (lodash.isEmpty(compatibleCollectorIds)) {
          sidecarCollectors.push({ collector: {}, sidecar: sidecar });
          return;
        }

        compatibleCollectorIds
          .map(id => lodash.find(collectors.collectors, { id: id }))
          .forEach((compatibleCollector) => {
            sidecarCollectors.push({ collector: compatibleCollector, sidecar: sidecar });
          });
      });

    return (
      <CollectorsAdministration sidecarCollectorPairs={sidecarCollectors}
                                collectors={collectors.collectors}
                                configurations={configurations.configurations}
                                pagination={sidecars.pagination}
                                query={sidecars.query}
                                onPageChange={this.handlePageChange}
                                onFilter={this.handleFilter}
                                onQueryChange={this.handleQueryChange} />
    );
  },
});

export default CollectorsAdministrationContainer;
