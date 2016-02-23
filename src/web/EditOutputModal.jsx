import React from 'react';
import { Input } from 'react-bootstrap';
import Select from 'react-select';

import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { KeyValueTable } from 'components/common';

import EditOutputFields from 'EditOutputFields';

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

    getInitialState() {
        return {
            id: this.props.id,
            name: this.props.name,
            backend: this.props.backend,
            type: this.props.type,
            properties: this.props.properties,
            selectedType: {value: this.props.backend + ':' + this.props.type},
            error: false,
            error_message: '',
        };
    },

    openModal() {
        this.refs.modal.open();
    },

    _getId(prefixIdName) {
        return this.state.name !== undefined ? prefixIdName + this.state.name : prefixIdName;
    },

    _closeModal() {
        this.refs.modal.close();
    },

    _saved() {
        this._closeModal();
        if (this.props.create) {
            this.setState({name: '', backend: '', type: '', selectedType: '', properties: {}});
        }
    },

    _save() {
        const configuration = this.state;

        if (!configuration.error) {
            this.props.saveOutput(configuration, this._saved);
        }
    },

    _changeName(event) {
        this.setState({name: event.target.value})
    },

    _changeProperties(properties) {
        this.setState({properties: properties})
    },

    _injectProperties(key, event) {
        let properties = this.state.properties;
        if(properties) {
            properties[key] = event.target.value;
        }
        this.setState({properties: properties});
    },

    _changeType(type) {
        const backendAndType = type.value.split(/:/, 2);
        this.setState({selectedType: type, backend: backendAndType[0], type: backendAndType[1]});
    },

    render() {
        let triggerButtonContent;
        if (this.props.create) {
            triggerButtonContent = 'Create output';
        } else {
            triggerButtonContent = <span>Edit</span>;
        }
        const types = [
            { value: 'nxlog:gelf-udp', label: '[NXLog] GELF output' }
        ];

        return (
        <span>
                <button onClick={this.openModal}
                        className={this.props.create ? 'btn btn-success' : 'btn btn-info btn-xs'}>
                    {triggerButtonContent}
                </button>
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
                               help={this.state.error ? this.state.error_message : null}
                               autoFocus
                               required/>
                        <Select ref="select-type"
                            options={types}
                            value={this.state.selectedType ? this.state.selectedType.value : null}
                            onChange={(type) => this._changeType(type)}
                            placeholder="Choose output type..."
                        />
                        <EditOutputFields type={this.state.selectedType} properties={this.props.properties} injectProperties={this._injectProperties} />
                    </fieldset>
                </BootstrapModalForm>
            </span>
    );
  },
});

export default EditOutputModal;
