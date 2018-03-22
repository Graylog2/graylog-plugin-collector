import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Button, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';

import OperatingSystemIcon from 'sidecars/OperatingSystemIcon';

const CollectorRow = createReactClass({
  propTypes: {
    collector: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  },

  handleEdit() {
    this.props.onEdit(this.props.collector);
  },

  handleClone() {
    this.props.onClone(this.props.collector);
  },

  handleDelete() {
    const collector = this.props.collector;
    if (window.confirm(`You are about to delete collector "${collector.name}". Are you sure?`)) {
      this.props.onDelete(collector);
    }
  },

  render() {
    const { collector } = this.props;
    return (
      <tr>
        <td>
          {collector.name}
        </td>
        <td>
          <OperatingSystemIcon operatingSystem={collector.node_operating_system} /> {lodash.upperFirst(collector.node_operating_system)}
        </td>
        <td>
          <ButtonToolbar>
            <Button bsStyle="info" bsSize="xsmall" onClick={this.handleEdit}>Edit</Button>
            <DropdownButton id={`more-actions-${collector.id}`} title="More actions" bsSize="xsmall" pullRight>
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

export default CollectorRow;
