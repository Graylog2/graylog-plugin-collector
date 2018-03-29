import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import { SelectPopover } from 'components/common';
import { BootstrapModalConfirm } from 'components/bootstrap';
import { naturalSortIgnoreCase } from 'util/SortUtils';
import CollectorIndicator from '../sidecars/CollectorIndicator';

class CollectorConfigurationSelector extends React.Component {
  static propTypes = {
    collectors: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
    selectedCollectors: PropTypes.array.isRequired,
    onConfigurationSelectionChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedConfigurations: [],
    };
  }

  handleConfigurationSelect = (configurationIds, hideCallback) => {
    hideCallback();
    const configurations = this.props.configurations.filter(c => configurationIds.includes(c.id));
    this.setState({ selectedConfigurations: [configurations[0]] }, this.modal.open);
  };

  confirmConfigurationChange = (doneCallback) => {
    this.props.onConfigurationSelectionChange(this.state.selectedConfigurations, doneCallback);
  };

  cancelConfigurationChange = () => {
    this.setState({ selectedConfigurations: [] });
  };

  render() {
    const { selectedConfigurations } = this.state;
    const { selectedCollectors } = this.props;

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

    const formattedSummary = selectedCollectors.map(({ id, collector }) => {
      return (
        <dd key={id}>{collector.sidecar.node_name}, {collector.collector.name}</dd>
      );
    });

    return (
      <span>
        <SelectPopover id="status-filter"
                       title="Apply configuration"
                       triggerNode={<Button bsSize="small" bsStyle="link">Configure <span className="caret" /></Button>}
                       items={configurations}
                       itemFormatter={configurationFormatter}
                       onItemSelect={this.handleConfigurationSelect}
                       filterPlaceholder="Filter by configuration" />

        <BootstrapModalConfirm ref={(c) => { this.modal = c; }}
                               title="Configuration summary"
                               onConfirm={this.confirmConfigurationChange}
                               onCancel={this.cancelConfigurationChange}>
          <div>
            <p>
              {selectedConfigurations.length > 0 &&
              <span>You are going to <b>apply</b> the <em>{selectedConfigurations.name}</em> configuration to:</span>
              }
            </p>

            <dl>
              {formattedSummary}
            </dl>

            <p>Are you sure you want to proceed with this action?</p>
          </div>
        </BootstrapModalConfirm>
      </span>
    );
  }
}

export default CollectorConfigurationSelector;