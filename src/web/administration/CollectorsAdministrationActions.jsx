import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Button, ButtonToolbar } from 'react-bootstrap';

import { SelectPopover } from 'components/common';
import { naturalSortIgnoreCase } from 'util/SortUtils';
import BackendIndicator from '../collectors/BackendIndicator';

const CollectorsAdministrationActions = createReactClass({
  propTypes: {
    backends: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
  },

  getConfigurationAction() {
    const configurations = this.props.configurations
      .sort((c1, c2) => naturalSortIgnoreCase(c1.name, c2.name))
      .map(c => c.id);
    const configurationFormatter = (configurationId) => {
      const configuration = this.props.configurations.find(c => c.id === configurationId);
      const backend = this.props.backends.find(b => b.id === configuration.backend_id);
      return (
        <span>
          {configuration.name}&emsp;
          <small>
            {backend ?
              <BackendIndicator backend={backend.name} operatingSystem={backend.node_operating_system} /> :
              <em>Unknown backend</em>
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
                     onItemSelect={this.showConfigurationSummary}
                     filterPlaceholder="Filter by configuration" />
    );
  },

  showConfigurationSummary(item) {
    alert(`YOLO ${JSON.stringify(item)}`);
  },

  render() {
    return (
      <ButtonToolbar>
        <Button bsSize="small" bsStyle="link">Process <span className="caret" /></Button>
        {this.getConfigurationAction()}
      </ButtonToolbar>
    );
  },
});

export default CollectorsAdministrationActions;
