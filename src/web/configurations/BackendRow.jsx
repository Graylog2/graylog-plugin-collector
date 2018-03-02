import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Button, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';

import OperatingSystemIcon from 'collectors/OperatingSystemIcon';

const BackendRow = createReactClass({
  propTypes: {
    backend: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  },

  handleEdit() {
    this.props.onEdit(this.props.backend);
  },

  handleClone() {
    this.props.onClone(this.props.backend);
  },

  handleDelete() {
    const backend = this.props.backend;
    if (window.confirm(`You are about to delete backend "${backend.name}". Are you sure?`)) {
      this.props.onDelete(backend);
    }
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
            <Button bsStyle="info" bsSize="xsmall" onClick={this.handleEdit}>Edit</Button>
            <DropdownButton id={`more-actions-${backend.id}`} title="More actions" bsSize="xsmall" pullRight>
              <MenuItem onSelect={this.handleClone}>Clone</MenuItem>
              <MenuItem divider />
              <MenuItem onSelect={this.handleDelete}>Delete</MenuItem>
            </DropdownButton>
          </ButtonToolbar>
        </td>
      </tr>
    );
  },
});

export default BackendRow;
