import React from 'react';
import { Button, Label } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import EditConfigurationModal from './EditConfigurationModal';

import Routes from 'routing/Routes';

const ConfigurationRow = React.createClass({
  propTypes: {
    configuration: React.PropTypes.object.isRequired,
    onUpdate: React.PropTypes.func.isRequired,
    validateConfiguration: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
  },

  componentDidMount() {
    this.style.use();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/CollectorStyles.css'),

  _handleClick() {
    const configuration = this.props.configuration;
    if (window.confirm(`You are about to delete configuration "${configuration.name}". Are you sure?`)) {
      this.props.onDelete(configuration);
    }
  },

  render() {
    const configuration = this.props.configuration;
    const tagBadges = configuration.tags.map((tag) => {
      return <Label key={tag} bsStyle="default" className="configuration-tag">{tag}</Label>;
    });

    return (
      <tr>
        <td className="name limited">
          <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_CONFIGURATIONS_ID')(configuration.id)}>
            <a>{configuration.name}</a>
          </LinkContainer>
        </td>
        <td className="limited">
          {tagBadges}
        </td>
        <td className="actions">
          <Button bsStyle="primary" bsSize="xsmall" onClick={this._handleClick}>
            Delete
          </Button>
          &nbsp;
          <EditConfigurationModal configuration={this.props.configuration}
                                  updateConfiguration={this.props.onUpdate}
                                  validConfigurationName={this.props.validateConfiguration} />
        </td>
      </tr>
    );
  },
});

export default ConfigurationRow;
