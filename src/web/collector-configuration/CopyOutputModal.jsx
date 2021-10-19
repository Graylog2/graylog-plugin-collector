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
import { BootstrapModalForm, Input } from 'components/bootstrap';

class CopyOutputModal extends React.Component {
    static propTypes = {
      id: PropTypes.string,
      copyOutput: PropTypes.func.isRequired,
      validOutputName: PropTypes.func.isRequired,
    };

    static defaultProps = {
      id: '',
      name: '',
    };

    state = {
      id: this.props.id,
      name: '',
      error: false,
      error_message: '',
    };

    openModal = () => {
      this.refs.modal.open();
    };

    _getId = (prefixIdName) => {
      return prefixIdName + this.state.name;
    };

    _closeModal = () => {
      this.refs.modal.close();
    };

    _saved = () => {
      this._closeModal();
      this.setState({ name: '' });
    };

    _save = () => {
      const configuration = this.state;

      if (!configuration.error) {
        this.props.copyOutput(this.props.id, this.state.name, this._saved);
      }
    };

    _changeName = (event) => {
      this.setState({ name: event.target.value });
    };

    render() {
      return (
        <span>
          <Button onClick={this.openModal}
                  bsStyle="warning"
                  bsSize="xsmall">
                  Clone
          </Button>
          <BootstrapModalForm ref="modal"
                              title="Clone"
                              onSubmitForm={this._save}
                              submitButtonText="Create">
            <fieldset>
              <Input type="text"
                     id={this._getId('output-name')}
                     label="Name"
                     defaultValue={this.state.name}
                     onChange={this._changeName}
                     bsStyle={this.state.error ? 'error' : null}
                     help={this.state.error ? this.state.error_message : 'Type a name for the new output'}
                     autoFocus
                     required />
            </fieldset>
          </BootstrapModalForm>
        </span>
      );
    }
}

export default CopyOutputModal;
