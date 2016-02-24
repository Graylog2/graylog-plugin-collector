import React from 'react';
import { Input } from 'react-bootstrap';
import Select from 'react-select';

import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';

import EditInputFields from './EditInputFields';

const EditInputModal = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        name: React.PropTypes.string,
        backend: React.PropTypes.string,
        type: React.PropTypes.string,
        forwardto: React.PropTypes.string,
        properties: React.PropTypes.object,
        outputs: React.PropTypes.array,
        create: React.PropTypes.bool,
        saveInput: React.PropTypes.func.isRequired,
        validInputName: React.PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            id: this.props.id,
            name: this.props.name,
            backend: this.props.backend,
            type: this.props.type,
            forwardto: {value: this.props.forwardto},
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
            this.setState({name: '', backend: '', type: '', selectedType: '', forwardto: {}, properties: {}});
        }
    },

    _save() {
        const configuration = this.state;

        if (!configuration.error) {
            this.props.saveInput(configuration, this._saved);
        }
    },

    _changeName(event) {
        this.setState({name: event.target.value});
    },

    _changeForwardtoDropdown(selectedValue) {
        this.setState({forwardto: {value: selectedValue.value}});
    },

    _changeProperties(properties) {
        this.setState({properties: properties});
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

    _formatDropdownOptions() {
        let options = [];

        if (this.props.outputs) {
            var outputCount = this.props.outputs.length;
            for (var i = 0; i < outputCount; i++) {
                options.push({value: this.props.outputs[i].name, label: this.props.outputs[i].name});
            }
        } else {
            options.push({value: 'none', label: 'No outputs available', disable: true});
        }

        return options;
    },

    render() {
        let triggerButtonContent;
        if (this.props.create) {
            triggerButtonContent = 'Create input';
        } else {
            triggerButtonContent = <span>Edit</span>;
        }
        const types = [
            { value: 'nxlog:file', label: '[NXLog] file input' },
            { value: 'nxlog:windows-event-log', label: '[NXLog] Windows event log' },
        ];

        return (
        <span>
                <button onClick={this.openModal}
                        className={this.props.create ? 'btn btn-success' : 'btn btn-info btn-xs'}>
                    {triggerButtonContent}
                </button>
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
                               help={this.state.error ? this.state.error_message : null}
                               autoFocus
                               required
                        />
                        <Input id={this._getId('input-foward-to')} label="Forward to">
                            <Select ref="select-forwardto"
                                    options={this._formatDropdownOptions()}
                                    value={this.state.forwardto ? this.state.forwardto.value : null}
                                    onChange={this._changeForwardtoDropdown}
                                    placeholder="Forward to output"
                            />
                        </Input>
                        <Input id={this._getId('input-type')} label="Type">
                            <Select ref="select-type"
                                    options={types}
                                    value={this.state.selectedType ? this.state.selectedType.value : null}
                                    onChange={(type) => this._changeType(type)}
                                    placeholder="Choose input type..."
                            />
                        </Input>
                        <EditInputFields type={this.state.selectedType} properties={this.props.properties} injectProperties={this._injectProperties} />
                    </fieldset>
                </BootstrapModalForm>
            </span>
    );
    },
});

export default EditInputModal;
