import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { LinkContainer } from 'react-router-bootstrap';

import { Button } from 'components/graylog';
import Routes from 'routing/Routes';

import EditConfigurationModal from './EditConfigurationModal';
import CopyConfigurationModal from './CopyConfigurationModal';


const ConfigurationRow = createReactClass({
  displayName: 'ConfigurationRow',

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

  _handleClick() {
    const { configuration } = this.props;
    if (window.confirm(`You are about to delete configuration "${configuration.name}". Are you sure?`)) {
      this.props.onDelete(configuration);
    }
  },

  render() {
    const { configuration } = this.props;
    const tagBadges = configuration.tags.map((tag) => {
      return <span className="badge configuration-tag" key={tag}>{tag}</span>;
    });

    return (
      <tr>
        <td className="name limited">
          <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_CONFIGURATIONS_ID')(configuration.id)}>
            <a>{configuration.name}</a>
          </LinkContainer>
        </td>
        <td>
          {tagBadges}
        </td>
        <td>
          <Button bsStyle="primary" bsSize="xsmall" onClick={this._handleClick}>
            Delete
          </Button>
          &nbsp;
          <CopyConfigurationModal id={this.props.configuration.id} validConfigurationName={this.props.validateConfiguration} copyConfiguration={this.props.onCopy} />
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
