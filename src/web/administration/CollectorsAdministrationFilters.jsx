import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Button, ButtonToolbar } from 'react-bootstrap';

import { SelectPopover } from 'components/common';
import { naturalSortIgnoreCase } from 'util/SortUtils';

const CollectorsAdministrationFilters = createReactClass({
  propTypes: {
    backends: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
    filter: PropTypes.func.isRequired,
  },

  getBackendsFilter() {
    const backends = lodash
      .uniq(this.props.backends.map(backend => backend.name))
      .sort(naturalSortIgnoreCase);

    const filter = backendName => this.props.filter(({ backend }) => backend.match(backendName, 'i'));

    return (
      <SelectPopover id="backend-filter"
                     title="Filter by backend"
                     triggerNode={<Button bsSize="small" bsStyle="link">Backend <span className="caret" /></Button>}
                     items={backends}
                     onItemSelect={filter}
                     filterPlaceholder="Filter by backend" />
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
      .uniq(this.props.backends.map(backend => lodash.upperFirst(backend.node_operating_system)))
      .sort(naturalSortIgnoreCase);

    const filter = os => this.props.filter(({ collector }) => collector.node_details.operating_system.match(os, 'i'));

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
        {this.getBackendsFilter()}
        {this.getConfigurationFilter()}
        {this.getOSFilter()}
        {this.getStatusFilter()}
      </ButtonToolbar>
    );
  },
});

export default CollectorsAdministrationFilters;
