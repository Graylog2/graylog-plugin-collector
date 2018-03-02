import PropTypes from 'prop-types';
import React from 'react';
import { Button, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';

import Routes from 'routing/Routes';

import EditConfigurationModal from './EditConfigurationModal';
import CopyConfigurationModal from './CopyConfigurationModal';

const ConfigurationRow = React.createClass({
  propTypes: {
    configuration: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
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

  style: require('!style/useable!css!styles/CollectorStyles.css'),

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
        <td className="name limited">
          <Link to={Routes.pluginRoute('SYSTEM_COLLECTORS_ALTCONFIGURATION_ID')(configuration.id)}>
            {configuration.name}
          </Link>
        </td>
        <td />
        <td>
          <ButtonToolbar>
            <EditConfigurationModal configuration={this.props.configuration}
                                    updateConfiguration={this.props.onUpdate}
                                    validConfigurationName={this.props.validateConfiguration} />
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
