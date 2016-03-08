import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';

import DeleteConfigurationButton from './DeleteConfigurationButton';

const ConfigurationRow = React.createClass({
  propTypes: {
    configuration: React.PropTypes.object.isRequired,
    onDelete: React.PropTypes.func.isRequired,
  },

  render() {
    const configuration = this.props.configuration;
    const tagBadges = configuration.tags.map((tag) => {
      return <span key={tag} className="label label-default" style={{ marginRight: 5 }}>{tag}</span>;
    });

    return (
      <tr>
        <td className="limited">
          <LinkContainer to={`/system/collectors/configurations/${configuration.id}`}>
            <a>{configuration.name}</a>
          </LinkContainer>
        </td>
        <td className="limited">
          {tagBadges}
        </td>
        <td className="actions">
          <DeleteConfigurationButton configuration={configuration} onClick={this.props.onDelete} />
        </td>
      </tr>
    );
  },
});

export default ConfigurationRow;
