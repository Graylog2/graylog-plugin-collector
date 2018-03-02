import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Button, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';

import OperatingSystemIcon from 'collectors/OperatingSystemIcon';

const BackendRow = createReactClass({
  propTypes: {
    backend: PropTypes.object.isRequired,
  },

  render() {
    const { backend } = this.props;
    return (
      <tr>
        <td>
          {backend.name}
        </td>
        <td>
          <OperatingSystemIcon operatingSystem={backend.node_operating_system} /> {backend.node_operating_system}
        </td>
        <td>
          <ButtonToolbar>
            <Button bsStyle="info" bsSize="xsmall">Edit</Button>
            <DropdownButton title="More actions" bsSize="xsmall" pullRight>
              <MenuItem>Clone</MenuItem>
              <MenuItem divider />
              <MenuItem>Delete</MenuItem>
            </DropdownButton>
          </ButtonToolbar>
        </td>
      </tr>
    );
  },
});

export default BackendRow;
