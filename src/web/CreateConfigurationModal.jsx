import React from 'react';
import { Input } from 'react-bootstrap';

import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';

import CollectorConfigurationsActions from './CollectorConfigurationsActions';

const CreateConfigurationModal = React.createClass({
    propTypes: {
        saveConfiguration: React.PropTypes.func.isRequired,
        validConfigurationName: React.PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            name: this.props.name,
            error: false,
            error_message: '',
        };
    },

    openModal() {
        this.refs.modal.open();
    },

    _closeModal() {
        this.refs.modal.close();
    },

    _getId(prefixIdName) {
        return this.state.name !== undefined ? prefixIdName + this.state.name : prefixIdName;
    },

    _saved() {
        this._closeModal();
        this.setState({name: '', type: ''});
    },

    _save() {
        const configuration = this.state;

        if (!configuration.error) {
            this.props.saveConfiguration(configuration, this._saved);
        }
    },

    _changeName(event) {
        const name = event.target.value;
        if (!this.props.validConfigurationName(name)) {
            this.setState({name: name, error: true, error_message: 'Configuration with that name already exists!'});
        } else {
            this.setState({name: name, error: false, error_message: ''});
        }
    },

    render() {
        return (
            <span>
                <button onClick={this.openModal}
                        className='btn btn-success btn-md pull-right'>
                    Create configuration
                </button>
                <BootstrapModalForm ref="modal"
                                    title={`Create Configuration ${this.state.name}`}
                                    onSubmitForm={this._save}
                                    submitButtonText="Save">
                    <fieldset>
                        <Input type="text"
                               id={this._getId('configuration-name')}
                               label="Name"
                               defaultValue={this.state.name}
                               onChange={this._changeName}
                               bsStyle={this.state.error ? 'error' : null}
                               help={this.state.error ? this.state.error_message : null}
                               autoFocus
                               required/>
                    </fieldset>
                </BootstrapModalForm>
            </span>
        );
    },
});

export default CreateConfigurationModal;