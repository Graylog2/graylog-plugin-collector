/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'components/bootstrap';

class DeleteConfirmButton extends React.Component {
  static propTypes = {
    entity: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  handleClick = () => {
    if (window.confirm(`You are about to delete ${this.props.type} "${this.props.entity.name}". Are you sure?`)) {
      this.props.onClick(this.props.entity);
    }
  };

  render() {
    return (
      <Button bsStyle="primary" bsSize="xsmall" onClick={this.handleClick}>
        Delete
      </Button>
    );
  }
}

export default DeleteConfirmButton;
