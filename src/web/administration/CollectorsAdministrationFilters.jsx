import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Button, ButtonToolbar } from 'react-bootstrap';

import { SelectPopover } from 'components/common';
import { naturalSortIgnoreCase } from 'util/SortUtils';

const CollectorsAdministrationFilters = createReactClass({
  propTypes: {
    collectors: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
    filter: PropTypes.func.isRequired,
  },

  getCollectorsFilter() {
    const collectors = lodash
      .uniq(this.props.collectors.map(collector => collector.name))
      .sort(naturalSortIgnoreCase);

    const filter = ([collectorName]) => this.props.filter(({ collector }) => collector.match(collectorName, 'i'));

    return (
      <SelectPopover id="collector-filter"
                     title="Filter by collector"
                     triggerNode={<Button bsSize="small" bsStyle="link">Collector <span className="caret" /></Button>}
                     items={collectors}
                     onItemSelect={filter}
                     filterPlaceholder="Filter by collector" />
    );
  },

  getConfigurationFilter() {
    const configurations = this.props.configurations.map(configuration => configuration.name).sort(naturalSortIgnoreCase);

    return (
      <SelectPopover id="configuration-filter"
                     title="Filter by configuration"
                     triggerNode={<Button bsSize="small" bsStyle="link">Configuration <span className="caret" /></Button>}
                     items={configurations}
                     onItemSelect={() => {}}
                     filterPlaceholder="Filter by configuration" />
    );
  },

  getOSFilter() {
    const operatingSystems = lodash
      .uniq(this.props.collectors.map(collector => lodash.upperFirst(collector.node_operating_system)))
      .sort(naturalSortIgnoreCase);

    const filter = ([os]) => this.props.filter(({ sidecar }) => sidecar.node_details.operating_system.match(os, 'i'));

    return (
      <SelectPopover id="os-filter"
                     title="Filter by OS"
                     triggerNode={<Button bsSize="small" bsStyle="link">OS <span className="caret" /></Button>}
                     items={operatingSystems}
                     onItemSelect={filter}
                     filterPlaceholder="Filter by OS" />
    );
  },

  getStatusFilter() {
    // TODO Implement this filter
    return (
      <SelectPopover id="status-filter"
                     title="Filter by status"
                     triggerNode={<Button bsSize="small" bsStyle="link">Status <span className="caret" /></Button>}
                     items={[]}
                     onItemSelect={() => {}}
                     filterPlaceholder="Filter by status" />
    );
  },

  render() {
    return (
      <ButtonToolbar>
        {this.getCollectorsFilter()}
        {this.getConfigurationFilter()}
        {this.getOSFilter()}
        {this.getStatusFilter()}
      </ButtonToolbar>
    );
  },
});

export default CollectorsAdministrationFilters;
