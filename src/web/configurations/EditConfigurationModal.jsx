import React from 'react';
import { Button } from 'react-bootstrap';

import { BootstrapModalForm, Input } from 'components/bootstrap';
import ObjectUtils from 'util/ObjectUtils';

const EditConfigurationModal = React.createClass({
  propTypes: {
    configuration: React.PropTypes.object,
    create: React.PropTypes.bool,
    updateConfiguration: React.PropTypes.func.isRequired,
    validConfigurationName: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      configuration: { name: '' },
    };
  },

  getInitialState() {
    return {
      configuration: ObjectUtils.clone(this.props.configuration),
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
    return prefixIdName + this.state.configuration.name;
  },

  _saved() {
    this._closeModal();
    this.setState(this.getInitialState());
  },

  _save() {
    const configuration = this.state.configuration;

    if (!this.state.error) {
      this.props.updateConfiguration(configuration, this._saved);
    }
  },

  _changeName(event) {
    const name = event.target.value;
    const newConfiguration = ObjectUtils.clone(this.state.configuration);
    newConfiguration.name = name;

    if (!this.props.validConfigurationName(name)) {
      this.setState({
        configuration: newConfiguration,
        error: true,
        error_message: 'Configuration with that name already exists!',
      });
    } else {
      this.setState({ configuration: newConfiguration, error: false, error_message: '' });
    }
  },

  render() {
    return (
      <span>
        <Button onClick={this.openModal}
                bsStyle={this.props.create ? 'success' : 'info'}
                bsSize={this.props.create ? null : 'xsmall'}>
          {this.props.create ? 'Create configuration' : 'Edit'}
        </Button>
        <BootstrapModalForm ref="modal"
                            title={`${this.props.create ? 'Create' : 'Edit'} Configuration ${this.state.configuration.name}`}
                            onSubmitForm={this._save}
                            submitButtonText="Save">
          <fieldset>
            <Input type="text"
                   id={this._getId('configuration-name')}
                   label="Name"
                   defaultValue={this.state.configuration.name}
                   onChange={this._changeName}
                   bsStyle={this.state.error ? 'error' : null}
                   help={this.state.error ? this.state.error_message : 'Name for this configuration'}
                   autoFocus
                   required />
          </fieldset>
        </BootstrapModalForm>
      </span>
    );
  },
});

export default EditConfigurationModal;
