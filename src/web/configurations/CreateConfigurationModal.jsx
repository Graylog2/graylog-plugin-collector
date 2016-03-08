import React from 'react';
import { Button, Input } from 'react-bootstrap';

import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';

const CreateConfigurationModal = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    saveConfiguration: React.PropTypes.func.isRequired,
    validConfigurationName: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      name: '',
    };
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
    return typeof this.state.name !== 'undefined' ? (prefixIdName + this.state.name) : prefixIdName;
  },

  _saved() {
    this._closeModal();
    this.setState({ name: '', type: '' });
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
      this.setState({ name, error: true, error_message: 'Configuration with that name already exists!' });
    } else {
      this.setState({ name, error: false, error_message: '' });
    }
  },

  render() {
    return (
      <div>
        <div className="pull-right">
          <Button onClick={this.openModal} bsStyle="success">
            Create configuration
          </Button>
        </div>
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
                   help={this.state.error ? this.state.error_message : 'Name for this configuration'}
                   autoFocus
                   required />
          </fieldset>
        </BootstrapModalForm>
      </div>
    );
  },
});

export default CreateConfigurationModal;