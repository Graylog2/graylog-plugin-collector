import React from 'react';
import { Input } from 'react-bootstrap';

import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { KeyValueTable, Select } from 'components/common';

import CollectorsActions from './CollectorsActions';

const EditSnippetModal = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        name: React.PropTypes.string,
        snippet: React.PropTypes.string,
        backend: React.PropTypes.string,
        create: React.PropTypes.bool,
        saveSnippet: React.PropTypes.func.isRequired,
        validSnippetName: React.PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            id: this.props.id,
            name: this.props.name,
            snippet: this.props.snippet,
            backend: this.props.backend,
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
            this.setState({name: '', type: '', snippet: ''});
        }
    },

    _save() {
        const configuration = this.state;

        if (!configuration.error) {
            this.props.saveSnippet(configuration, this._saved);
        }
    },

    _changeName(event) {
        this.setState({name: event.target.value});
    },

    _changeBackend(selectedBackend) {
        this.setState({backend: selectedBackend});
    },

    _changeSnippet(event) {
        this.setState({snippet: event.target.value});
    },

    render() {
        let triggerButtonContent;
        if (this.props.create) {
            triggerButtonContent = 'Create snippet';
        } else {
            triggerButtonContent = <span>Edit</span>;
        }
        const backends = [
            { value: 'nxlog', label: 'NXLog' },
        ];

        return (
            <span>
                <button onClick={this.openModal}
                        className={this.props.create ? 'btn btn-success' : 'btn btn-info btn-xs'}>
                    {triggerButtonContent}
                </button>
                <BootstrapModalForm ref="modal"
                                    title={`${this.props.create ? 'Create' : 'Edit'} Snippet ${this.state.name}`}
                                    onSubmitForm={this._save}
                                    submitButtonText="Save">
                    <fieldset>
                        <Input type="text"
                               id={this._getId('snippet-name')}
                               label="Name"
                               defaultValue={this.state.name}
                               onChange={this._changeName}
                               bsStyle={this.state.error ? 'error' : null}
                               help={this.state.error ? this.state.error_message : null}
                               autoFocus
                               required/>
                        <Input id={this._getId('snippet-backend')}
                               label="Backend">
                                <Select ref="select-backend"
                                    options={backends}
                                    value={this.state.backend}
                                    onChange={this._changeBackend}
                                    placeholder="Backend collector type"
                                 />
                        </Input>
                        <Input type="textarea"
                               id={this._getId('snippet-content')}
                               label="Snippet"
                               rows="10"
                               defaultValue={this.state.snippet}
                               onChange={this._changeSnippet}
                               bsStyle={this.state.error ? 'error' : null}
                               help={this.state.error ? this.state.error_message : null}
                               required/>
                    </fieldset>
                </BootstrapModalForm>
            </span>
        );
    },
});

export default EditSnippetModal;