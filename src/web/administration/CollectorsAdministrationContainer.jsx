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
    CollectorConfigurationsActions.list({ pageSize: 0 });
  },

  handlePageChange(page, pageSize) {
    const { filters, pagination, query } = this.state;
    const effectivePage = pagination.pageSize !== pageSize ? 1 : page;
    SidecarsActions.listAdministration({ query: query, filters: filters, page: effectivePage, pageSize: pageSize });
  },

  handleFilter(property, value) {
    const { filters, pagination, query } = this.state;
    const newFilters = lodash.cloneDeep(filters);
    newFilters[property] = value;
    SidecarsActions.listAdministration({ query: query, filters: newFilters, pageSize: pagination.pageSize });
  },

  handleQueryChange(query = '', callback = () => {}) {
    const { filters, pagination } = this.state;
    SidecarsActions.listAdministration({ query: query, filters: filters, pageSize: pagination.pageSize }).finally(callback);
  },

  render() {
    const { collectors, configurations, sidecars, pagination, query } = this.state;
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
                                query={query}
                                onPageChange={this.handlePageChange}
                                onFilter={this.handleFilter}
                                onQueryChange={this.handleQueryChange} />
    );
  },
});

export default CollectorsAdministrationContainer;
