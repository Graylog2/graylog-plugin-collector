import React from 'react';
import { Button } from 'react-bootstrap';

const DeleteConfirmButton = React.createClass({
  propTypes: {
    entity: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func.isRequired,
  },

  handleClick() {
    if (window.confirm(`You are about to delete ${this.props.type} "${this.props.entity.name}". Are you sure?`)) {
      this.props.onClick(this.props.entity);
    }
  },

  render() {
    return (
      <Button bsStyle="primary" bsSize="xsmall" onClick={this.handleClick}>
        Delete
      </Button>
    );
  },
});

export default DeleteConfirmButton;
