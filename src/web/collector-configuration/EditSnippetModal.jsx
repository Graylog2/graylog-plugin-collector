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
import { Select } from 'components/common';

class EditSnippetModal extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    snippet: PropTypes.string,
    backend: PropTypes.string,
    create: PropTypes.bool,
    saveSnippet: PropTypes.func.isRequired,
    validSnippetName: PropTypes.func.isRequired,
    selectedGroup: PropTypes.string.isRequired,
  };

  static defaultProps = {
    id: '',
    name: '',
  };

  state = {
    id: this.props.id,
    name: this.props.name,
    snippet: this.props.snippet,
    backend: this.props.backend,
    error: false,
    error_message: '',
    showModal: false,
  };

  openModal = () => {
    this.setState({ showModal: true });
  };

  _getId = (prefixIdName) => {
    return prefixIdName + this.state.name;
  };

  _closeModal = () => {
    this.setState({ showModal: false });
  };

  _saved = () => {
    this._closeModal();
    if (this.props.create) {
      this.setState({ name: '', type: '', snippet: '' });
    }
  };

  _save = () => {
    const configuration = this.state;

    if (!configuration.error) {
      this.props.saveSnippet(configuration, this._saved);
    }
  };

  _changeName = (event) => {
    this.setState({ name: event.target.value });
  };

  _changeBackend = (selectedBackend) => {
    this.setState({ backend: selectedBackend });
  };

  _changeSnippet = (event) => {
    this.setState({ snippet: event.target.value });
  };

  render() {
    let triggerButtonContent;
    if (this.props.create) {
      triggerButtonContent = 'Create Snippet';
    } else {
      triggerButtonContent = <span>Edit</span>;
    }
    const backends = [
      { group: 'nxlog', value: 'nxlog', label: 'NXLog' },
      { group: 'beat', value: 'filebeat', label: 'FileBeat' },
      { group: 'beat', value: 'winlogbeat', label: 'WinLogBeat' },
    ];

    return (
      <span>
        <Button onClick={this.openModal}
                bsStyle={this.props.create ? 'success' : 'info'}
                bsSize={this.props.create ? null : 'xsmall'}>
          {triggerButtonContent}
        </Button>
        <BootstrapModalForm show={this.state.showModal}
                            onCancel={this._closeModal}
                            title={`${this.props.create ? 'Create' : 'Edit'} Snippet ${this.state.name}`}
                            data-telemetry-title={`${this.props.create ? 'Create' : 'Edit'} Snippet`}
                            onSubmitForm={this._save}
                            submitButtonText="Save">
          <fieldset>
            <Input type="text"
                   id={this._getId('snippet-name')}
                   label="Name"
                   defaultValue={this.state.name}
                   onChange={this._changeName}
                   bsStyle={this.state.error ? 'error' : null}
                   help={this.state.error ? this.state.error_message : 'Type a name for this snippet'}
                   autoFocus
                   required />
            <Input id={this._getId('snippet-backend')}
                   label="Backend"
                   help="Select the backend to use for your snippet">
              <Select ref="select-backend"
                      options={backends.filter(backend => backend.group === this.props.selectedGroup)}
                      value={this.state.backend}
                      onChange={this._changeBackend}
                      placeholder="Backend collector type" />
            </Input>
            <Input type="textarea"
                   id={this._getId('snippet-content')}
                   label="Snippet"
                   rows="10"
                   defaultValue={this.state.snippet}
                   onChange={this._changeSnippet}
                   bsStyle={this.state.error ? 'error' : null}
                   help={this.state.error ? this.state.error_message : 'Write your verbatim configuration snippet'}
                   required />
          </fieldset>
        </BootstrapModalForm>
      </span>
    );
  }
}

export default EditSnippetModal;
