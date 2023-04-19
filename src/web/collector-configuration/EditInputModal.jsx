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
import { Select } from 'components/common';
import { BootstrapModalForm, Input } from 'components/bootstrap';

import EditInputFields from './EditInputFields';

class EditInputModal extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    backend: PropTypes.string,
    type: PropTypes.string,
    forwardTo: PropTypes.string,
    properties: PropTypes.object,
    outputs: PropTypes.array,
    create: PropTypes.bool,
    saveInput: PropTypes.func.isRequired,
    validInputName: PropTypes.func.isRequired,
    selectedGroup: PropTypes.string.isRequired,
  };

  static defaultProps = {
    id: '',
    name: '',
    properties: {},
  };

  state = {
    id: this.props.id,
    name: this.props.name,
    backend: this.props.backend,
    type: this.props.type,
    forwardTo: this.props.forwardTo,
    properties: this.props.properties,
    selectedType: (this.props.backend && this.props.type) ? `${this.props.backend}:${this.props.type}` : undefined,
    error: false,
    errorMessage: '',
    errorFields: [],
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
      this.setState({ name: '', backend: '', type: '', selectedType: '', forwardTo: '', properties: {} });
    }
  };

  _save = () => {
    const configuration = this.state;

    if (!configuration.error) {
      this.props.saveInput(configuration, this._saved);
    }
  };

  _changeErrorState = (error, message, id) => {
    const errorFields = this.state.errorFields.slice();
    const index = errorFields.indexOf(id);
    if (error && index == -1) {
      errorFields.push(id);
    }
    if (!error && index > -1) {
      errorFields.splice(index, 1);
    }
    this.setState({ error: error, errorMessage: message, errorFields: errorFields });
  };

  _changeName = (event) => {
    this.setState({ name: event.target.value });
  };

  _changeForwardtoDropdown = (selectedValue) => {
    this.setState({ forwardTo: selectedValue });
  };

  _changeProperties = (properties) => {
    this.setState({ properties });
  };

  _changeType = (type) => {
    const backendAndType = type.split(/:/, 2);
    this.setState({ selectedType: type, backend: backendAndType[0], type: backendAndType[1], properties: {} });
  };

  _injectProperties = (key, value) => {
    const { properties } = this.state;
    if (properties) {
      properties[key] = value;
    }
    this.setState({ properties });
  };

  _fieldError = (name) => {
    return this.state.error && this.state.errorFields.indexOf(this._getId(name)) !== -1;
  };

  _formatDropdownOptions = () => {
    const options = [];

    if (this.props.outputs) {
      const outputCount = this.props.outputs.length;
      for (let i = 0; i < outputCount; i++) {
        options.push({ value: this.props.outputs[i].output_id, label: `${this.props.outputs[i].name} [${this.props.outputs[i].backend}]` });
      }
    } else {
      options.push({ value: 'none', label: 'No outputs available', disable: true });
    }

    return options;
  };

  render() {
    let triggerButtonContent;
    if (this.props.create) {
      triggerButtonContent = 'Create Input';
    } else {
      triggerButtonContent = <span>Edit</span>;
    }
    const types = [
      { group: 'nxlog', value: 'nxlog:file', label: '[NXLog] file input' },
      { group: 'nxlog', value: 'nxlog:windows-event-log', label: '[NXLog] Windows event log' },
      { group: 'nxlog', value: 'nxlog:udp-syslog', label: '[NXLog] UDP syslog listener' },
      { group: 'nxlog', value: 'nxlog:tcp-syslog', label: '[NXLog] TCP syslog listener' },
      { group: 'beat', value: 'filebeat:file', label: '[FileBeat] file input' },
      { group: 'beat', value: 'winlogbeat:windows-event-log', label: '[WinLogBeat] Windows event log' },
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
                            title={`${this.props.create ? 'Create' : 'Edit'} Input ${this.state.name}`}
                            data-telemetry-title={`${this.props.create ? 'Create' : 'Edit'} Input`}
                            onSubmitForm={this._save}
                            submitButtonText="Save">
          <fieldset>
            <Input type="text"
                   id={this._getId('input-name')}
                   label="Name"
                   defaultValue={this.state.name}
                   onChange={this._changeName}
                   bsStyle={this._fieldError('input-name') ? 'error' : null}
                   help={this._fieldError('input-name') ? this.state.errorMessage : 'Type a name for this input'}
                   autoFocus
                   required />
            <Input id={this._getId('input-foward-to')}
                   label="Forward to (Required)"
                   help="Choose the collector output that will forward messages from this input">
              <Select ref="select-forwardto"
                      options={this._formatDropdownOptions()}
                      value={this.state.forwardTo}
                      onChange={this._changeForwardtoDropdown}
                      placeholder="Forward to output" />
            </Input>
            <Input id={this._getId('input-type')}
                   label="Type"
                   help="Choose the input type you want to configure">
              <Select ref="select-type"
                      options={types.filter(type => type.group === this.props.selectedGroup)}
                      value={this.state.selectedType}
                      onChange={this._changeType}
                      placeholder="Choose input type..." />
            </Input>
            <EditInputFields type={this.state.selectedType}
                             properties={this.state.properties}
                             injectProperties={this._injectProperties}
                             errorState={this._changeErrorState}
                             errorFields={this.state.errorFields} />
          </fieldset>
        </BootstrapModalForm>
      </span>
    );
  }
}

export default EditInputModal;
