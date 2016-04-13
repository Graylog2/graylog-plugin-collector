import React from 'react';
import { Button, Input } from 'react-bootstrap';
import { Select } from 'components/common';

import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';

import EditInputFields from './EditInputFields';

const EditInputModal = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    name: React.PropTypes.string,
    backend: React.PropTypes.string,
    type: React.PropTypes.string,
    forwardTo: React.PropTypes.string,
    properties: React.PropTypes.object,
    outputs: React.PropTypes.array,
    create: React.PropTypes.bool,
    saveInput: React.PropTypes.func.isRequired,
    validInputName: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      id: '',
      name: '',
      properties: {},
    };
  },

  getInitialState() {
    return {
      id: this.props.id,
      name: this.props.name,
      backend: this.props.backend,
      type: this.props.type,
      forwardTo: this.props.forwardTo,
      properties: this.props.properties,
      selectedType: (this.props.backend && this.props.type) ? `${this.props.backend}:${this.props.type}` : undefined,
      error: false,
      error_message: '',
    };
  },

  openModal() {
    this.refs.modal.open();
  },

  _getId(prefixIdName) {
    return prefixIdName + this.state.name;
  },

  _closeModal() {
    this.refs.modal.close();
  },

  _saved() {
    this._closeModal();
    if (this.props.create) {
      this.setState({ name: '', backend: '', type: '', selectedType: '', forwardTo: '', properties: {} });
    }
  },

  _save() {
    const configuration = this.state;

    if (!configuration.error) {
      this.props.saveInput(configuration, this._saved);
    }
  },

  _changeName(event) {
    this.setState({ name: event.target.value });
  },

  _changeForwardtoDropdown(selectedValue) {
    this.setState({ forwardTo: selectedValue });
  },

  _changeProperties(properties) {
    this.setState({ properties });
  },

  _injectProperties(key, value) {
    const properties = this.state.properties;
    if (properties) {
      properties[key] = value;
    }
    this.setState({ properties });
  },

  _changeType(type) {
    const backendAndType = type.split(/:/, 2);
    this.setState({ selectedType: type, backend: backendAndType[0], type: backendAndType[1], properties: {} });
  },

  _formatDropdownOptions() {
    const options = [];

    if (this.props.outputs) {
      const outputCount = this.props.outputs.length;
      for (let i = 0; i < outputCount; i++) {
        options.push({ value: this.props.outputs[i].output_id, label: this.props.outputs[i].name });
      }
    } else {
      options.push({ value: 'none', label: 'No outputs available', disable: true });
    }

    return options;
  },

  render() {
    let triggerButtonContent;
    if (this.props.create) {
      triggerButtonContent = 'Create Input';
    } else {
      triggerButtonContent = <span>Edit</span>;
    }
    const types = [
      { value: 'nxlog:file', label: '[NXLog] file input' },
      { value: 'nxlog:windows-event-log', label: '[NXLog] Windows event log' },
      { value: 'topbeat:topbeat', label: '[TopBeat] Metrics'},
      { value: 'filebeat:file', label: '[FileBeat] file input'}
    ];

    return (
      <span>
        <Button onClick={this.openModal}
                bsStyle={this.props.create ? 'success' : 'info'}
                bsSize={this.props.create ? null : 'xsmall'}>
          {triggerButtonContent}
        </Button>
        <BootstrapModalForm ref="modal"
                            title={`${this.props.create ? 'Create' : 'Edit'} Input ${this.state.name}`}
                            onSubmitForm={this._save}
                            submitButtonText="Save">
          <fieldset>
            <Input type="text"
                   id={this._getId('input-name')}
                   label="Name"
                   defaultValue={this.state.name}
                   onChange={this._changeName}
                   bsStyle={this.state.error ? 'error' : null}
                   help={this.state.error ? this.state.error_message : 'Type a name for this input'}
                   autoFocus
                   required
            />
            <Input id={this._getId('input-foward-to')} label="Forward to"
                   help="Choose the collector output that will forward messages from this input">
              <Select ref="select-forwardto"
                      options={this._formatDropdownOptions()}
                      value={this.state.forwardTo}
                      onChange={this._changeForwardtoDropdown}
                      placeholder="Forward to output"
              />
            </Input>
            <Input id={this._getId('input-type')} label="Type"
                  help="Choose the input type you want to configure">
              <Select ref="select-type"
                      options={types}
                      value={this.state.selectedType}
                      onChange={this._changeType}
                      placeholder="Choose input type..."
              />
            </Input>
            <EditInputFields type={this.state.selectedType} properties={this.state.properties}
                             injectProperties={this._injectProperties} />
          </fieldset>
        </BootstrapModalForm>
      </span>
    );
  },
});

export default EditInputModal;
