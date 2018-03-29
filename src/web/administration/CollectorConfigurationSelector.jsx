import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import { SelectPopover } from 'components/common';
import { naturalSortIgnoreCase } from 'util/SortUtils';
import CollectorIndicator from '../sidecars/CollectorIndicator';

class CollectorConfigurationSelector extends React.Component {
  static propTypes = {
    collectors: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
    onConfigurationSelectionChange: PropTypes.func.isRequired,
  };

  onConfigurationSelect = (configurationIds, hideCallback) => {
    hideCallback();
    const configurations = this.props.configurations.filter(c => configurationIds.includes(c.id));
    this.props.onConfigurationSelectionChange(configurations);
  };

  render() {
    const configurations = this.props.configurations
      .sort((c1, c2) => naturalSortIgnoreCase(c1.name, c2.name))
      .map(c => c.id);
    const configurationFormatter = (configurationId) => {
      const configuration = this.props.configurations.find(c => c.id === configurationId);
      const collector = this.props.collectors.find(b => b.id === configuration.backend_id);
      return (
        <span>
          {configuration.name}&emsp;
          <small>
            {collector ?
              <CollectorIndicator collector={collector.name} operatingSystem={collector.node_operating_system} /> :
              <em>Unknown collector</em>
            }
          </small>
        </span>
      );
    };

    return (
      <SelectPopover id="status-filter"
                     title="Apply configuration"
                     triggerNode={<Button bsSize="small" bsStyle="link">Configure <span className="caret" /></Button>}
                     items={configurations}
                     itemFormatter={configurationFormatter}
                     onItemSelect={this.onConfigurationSelect}
                     filterPlaceholder="Filter by configuration" />
    );
  }
}

export default CollectorConfigurationSelector;
