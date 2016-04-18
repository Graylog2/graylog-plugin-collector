import React from 'react';
import { Button, Input } from 'react-bootstrap';

import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { Select } from 'components/common';

import EditOutputFields from './EditOutputFields';

const EditOutputModal = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    name: React.PropTypes.string,
    backend: React.PropTypes.string,
    type: React.PropTypes.string,
    properties: React.PropTypes.object,
    create: React.PropTypes.bool,
    saveOutput: React.PropTypes.func.isRequired,
    validOutputName: React.PropTypes.func.isRequired,
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
      this.setState({ name: '', backend: '', type: '', selectedType: '', properties: {} });
    }
  },

  _save() {
    const configuration = this.state;

    if (!configuration.error) {
      this.props.saveOutput(configuration, this._saved);
    }
  },

  _changeName(event) {
    this.setState({ name: event.target.value });
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

  render() {
    let triggerButtonContent;
    if (this.props.create) {
      triggerButtonContent = 'Create Output';
    } else {
      triggerButtonContent = <span>Edit</span>;
    }
    const types = [
      { value: 'nxlog:gelf-udp', label: '[NXLog] GELF UDP output' },
      //{ value: 'topbeat:elasticsearch', label: '[TopBeat] Elasticsearch output' },
      //{ value: 'topbeat:logstash', label: '[TopBeat] Logstash output' },
      //{ value: 'filebeat:elasticsearch', label: '[FileBeat] Elasticsearch output' },
      //{ value: 'filebeat:logstash', label: '[FileBeat] Logstash output' },
      //{ value: 'winlogbeat:elasticsearch', label: '[WinLogBeat] Elasticsearch output' },
      //{ value: 'winlogbeat:logstash', label: '[WinLogBeat] Logstash output' }
    ];

    return (
      <span>
        <Button onClick={this.openModal}
                bsStyle={this.props.create ? 'success' : 'info'}
                bsSize={this.props.create ? null : 'xsmall'}>
          {triggerButtonContent}
        </Button>
        <BootstrapModalForm ref="modal"
                            title={`${this.props.create ? 'Create' : 'Edit'} Output ${this.state.name}`}
                            onSubmitForm={this._save}
                            submitButtonText="Save">
          <fieldset>
            <Input type="text"
                   id={this._getId('output-name')}
                   label="Name"
                   defaultValue={this.state.name}
                   onChange={this._changeName}
                   bsStyle={this.state.error ? 'error' : null}
                   help={this.state.error ? this.state.error_message : 'Type a name for this output'}
                   autoFocus
                   required />
            <Input id={this._getId('output-type')} label="Type" help="Choose the output type you want to configure">
              <Select ref="select-type"
                      options={types}
                      value={this.state.selectedType}
                      onValueChange={this._changeType}
                      placeholder="Choose output type..."
              />
            </Input>
            <EditOutputFields type={this.state.selectedType} properties={this.state.properties}
                              injectProperties={this._injectProperties} />
          </fieldset>
        </BootstrapModalForm>
      </span>
    );
  },
});

export default EditOutputModal;
