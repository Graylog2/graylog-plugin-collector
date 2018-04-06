import PropTypes from 'prop-types';
import React from 'react';
import { Button, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Routes from 'routing/Routes';

import CopyConfigurationModal from './CopyConfigurationModal';

const ConfigurationRow = React.createClass({
  propTypes: {
    configuration: PropTypes.object.isRequired,
    onCopy: PropTypes.func.isRequired,
    validateConfiguration: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  },

  componentDidMount() {
    this.style.use();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/SidecarStyles.css'),

  _handleDelete() {
    const configuration = this.props.configuration;
    if (window.confirm(`You are about to delete configuration "${configuration.name}". Are you sure?`)) {
      this.props.onDelete(configuration);
    }
  },

  render() {
    const configuration = this.props.configuration;

    return (
      <tr>
        <td className="name limited">{configuration.name}</td>
        <td />
        <td>
          <ButtonToolbar>
            <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_CONFIGURATION_EDIT_ID')(configuration.id)}>
              <Button onClick={this.openModal} bsStyle="info" bsSize="xsmall">Edit</Button>
            </LinkContainer>
            <DropdownButton id={`more-actions-${this.props.configuration.id}`}
                            title="More actions"
                            bsSize="xsmall"
                            pullRight>
              <CopyConfigurationModal id={this.props.configuration.id}
                                      validConfigurationName={this.props.validateConfiguration}
                                      copyConfiguration={this.props.onCopy} />
              <MenuItem divider />
              <MenuItem onSelect={this._handleDelete}>Delete</MenuItem>
            </DropdownButton>
          </ButtonToolbar>
        </td>
      </tr>
    );
  },
});

export default ConfigurationRow;
