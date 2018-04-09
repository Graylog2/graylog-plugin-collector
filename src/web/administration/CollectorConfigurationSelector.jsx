import React from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';
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
      nextAssignedConfigurations: [],
    };
  }

  getAssignedConfigurations = (selectedCollectors, configurations) => {
    const assignments = selectedCollectors.map(({ collector }) => collector.sidecar).reduce((accumulator, sidecar) => accumulator.concat(sidecar.assignments), []);
    return assignments.map(assignment => configurations.find(configuration => configuration.id === assignment.configuration_id));
  };

  handleConfigurationSelect = (configurationIds, hideCallback) => {
    hideCallback();
    let configurations = [];
    if (configurationIds.length > 0) {
      configurations = this.props.configurations.filter(c => configurationIds.includes(c.id));
    }
    this.setState({ nextAssignedConfigurations: configurations }, this.modal.open);
  };

  confirmConfigurationChange = (doneCallback) => {
    this.props.onConfigurationSelectionChange(this.state.nextAssignedConfigurations, doneCallback);
  };

  cancelConfigurationChange = () => {
    this.setState({ nextAssignedConfigurations: [] });
  };

  configurationFormatter = (configurationId) => {
    const { configurations, collectors } = this.props;
    const configuration = configurations.find(c => c.id === configurationId);
    const collector = collectors.find(b => b.id === configuration.backend_id);
    return (
      <span>
        {configuration.name}&emsp;
        <small>
          {collector ?
            <CollectorIndicator collector={collector.name}
                                operatingSystem={collector.node_operating_system} /> :
            <em>Unknown collector</em>
          }
        </small>
      </span>
    );
  };

  renderConfigurationSummary = (assignedConfigurations, nextAssignedConfigurations, selectedCollectors) => {
    const hasNewAssignedConfiguration = nextAssignedConfigurations.length === 1 && !assignedConfigurations.includes(nextAssignedConfigurations[0]);

    let actionSummary;
    if (nextAssignedConfigurations.length === 0) {
      actionSummary = <span>You are going to <b>remove</b> the configuration from:</span>;
    } else if (hasNewAssignedConfiguration) {
      actionSummary = <span>You are going to <b>apply</b> the <em>{nextAssignedConfigurations[0].name}</em> configuration to:</span>;
    } else {
      const removedConfiguration = lodash.without(assignedConfigurations, ...nextAssignedConfigurations)[0];
      actionSummary = removedConfiguration ? <span>You are going to <b>remove</b> configuration <em>{removedConfiguration.name}</em> from:</span> : '';
    }

    const formattedSummary = selectedCollectors.map(({ id, collector }) => {
      return (
        <dd key={id}>{collector.sidecar.node_name}, {collector.collector.name}</dd>
      );
    });

    return (
      <BootstrapModalConfirm ref={(c) => { this.modal = c; }}
                             title="Configuration summary"
                             onConfirm={this.confirmConfigurationChange}
                             onCancel={this.cancelConfigurationChange}>
        <div>
          <p>{actionSummary}</p>
          <dl>{formattedSummary}</dl>
          <p>Are you sure you want to proceed with this action?</p>
        </div>
      </BootstrapModalConfirm>
    );
  };

  render() {
    const { nextAssignedConfigurations } = this.state;
    const { configurations, selectedCollectors } = this.props;

    // Do not allow configuration changes when more than one log collector type is selected
    const selectedLogCollectors = lodash.uniq(selectedCollectors.map(({ collector }) => collector.collector));
    if (selectedLogCollectors.length > 1) {
      return (
        <SelectPopover id="status-filter"
                       title="Apply configuration"
                       triggerNode={<Button bsSize="small" bsStyle="link">Configure <span className="caret" /></Button>}
                       items={[`Cannot change configurations of ${selectedLogCollectors.map(collector => collector.name).join(', ')} collectors simultaneously`]}
                       displayDataFilter={false}
                       disabled />
      );
    }

    const configurationIds = configurations
      .filter(configuration => selectedLogCollectors[0].id === configuration.backend_id)
      .sort((c1, c2) => naturalSortIgnoreCase(c1.name, c2.name))
      .map(c => c.id);

    if (configurationIds.length === 0) {
      return (
        <SelectPopover id="status-filter"
                       title="Apply configuration"
                       triggerNode={<Button bsSize="small" bsStyle="link">Configure <span className="caret" /></Button>}
                       items={['No configurations available for the selected log collector']}
                       displayDataFilter={false}
                       disabled />
      );
    }

    const assignedConfigurations = this.getAssignedConfigurations(selectedCollectors, configurations)
      .filter(configuration => selectedLogCollectors[0].id === configuration.backend_id);

    return (
      <span>
        <SelectPopover id="status-filter"
                       title="Apply configuration"
                       triggerNode={<Button bsSize="small" bsStyle="link">Configure <span className="caret" /></Button>}
                       items={configurationIds}
                       itemFormatter={this.configurationFormatter}
                       onItemSelect={this.handleConfigurationSelect}
                       selectedItems={assignedConfigurations.map(config => config.id)}
                       filterPlaceholder="Filter by configuration" />
        {this.renderConfigurationSummary(assignedConfigurations, nextAssignedConfigurations, selectedCollectors)}
      </span>
    );
  }
}

export default CollectorConfigurationSelector;
