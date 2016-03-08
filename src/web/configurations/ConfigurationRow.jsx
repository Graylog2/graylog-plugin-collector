import React from 'react';
import { Button, Label } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import {} from 'styles/CollectorStyles.css';

const ConfigurationRow = React.createClass({
  propTypes: {
    configuration: React.PropTypes.object.isRequired,
    onDelete: React.PropTypes.func.isRequired,
  },

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
          <LinkContainer to={`/system/collectors/configurations/${configuration.id}`}>
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
        </td>
      </tr>
    );
  },
});

export default ConfigurationRow;
