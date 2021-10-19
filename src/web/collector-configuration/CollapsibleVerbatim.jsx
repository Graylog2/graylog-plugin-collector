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

import { Alert, Collapse } from 'components/bootstrap';
import { Input } from 'components/bootstrap';

class CollapsibleVerbatim extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    let expanded = false;
    if (props.value) {
      expanded = true;
    }

    this.state = {
      expanded: expanded,
    };
  }

  _onHandleToggle = (e) => {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  };

  _getId = (prefixIdName) => {
    return prefixIdName + this.props.type;
  };

  render() {
    const text = this.state.expanded ? 'Hide' : 'Add';

    return (
      <span className="verbatim-configuration">
        <a href="#" onClick={this._onHandleToggle}>{text} verbatim configuration</a>
        <Collapse in={this.state.expanded} timeout={0}>
          <Alert ref="well">
            <Input type="textarea"
                   id={this._getId('verbatim')}
                   label="Add verbatim configuration"
                   value={this.props.value}
                   onChange={this.props.onChange('verbatim')} />
          </Alert>
        </Collapse>
      </span>
    );
  }
}

export default CollapsibleVerbatim;
