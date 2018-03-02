import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Button } from 'react-bootstrap';

import { BootstrapModalForm, Input } from 'components/bootstrap';
import { Select, Spinner } from 'components/common';

import BackendsActions from './BackendsActions';
import BackendsStore from './BackendsStore';

const EditConfigurationModal = React.createClass({
  mixins: [Reflux.connect(BackendsStore)],

  propTypes: {
    create: PropTypes.bool,
    updateConfiguration: PropTypes.func.isRequired,
    validConfigurationName: PropTypes.func.isRequired,
  },

  componentWillMount() {
    this._loadBackends();
  },

  getDefaultProps() {
    return {
    };
  },

  getInitialState() {
    return {
      name: undefined,
      selectedBackend: undefined,
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
    return prefixIdName + this.state.name;
  },

  _loadBackends() {
    BackendsActions.list();
  },

  _saved() {
    this._closeModal();
    this.setState(this.getInitialState());
  },

  _save() {
    if (!this.state.error) {
      this.props.updateConfiguration(this.state.name, this.state.selectedBackend, this._saved);
    }
  },

  _formatBackendOptions() {
    const options = [];

    if (this.state.backends) {
      const backendCount = this.state.backends.length;
      for (let i = 0; i < backendCount; i += 1) {
        options.push({ value: this.state.backends[i].id, label: this.state.backends[i].name });
      }
    } else {
      options.push({ value: 'none', label: 'Loading backend list...', disable: true });
    }

    return options;
  },

  _changeName(event) {
    const newName = event.target.value;

    if (!this.props.validConfigurationName(newName)) {
      this.setState({
        error: true,
        error_message: 'Configuration with that name already exists!',
      });
    } else {
      this.setState({ name: newName, error: false, error_message: '' });
    }
  },

  _changeBackendDropdown(id) {
    this.setState({ selectedBackend: id });
  },

  render() {
    const { backends } = this.state;
    if (!backends) {
      return <Spinner />;
    }

    return (
      <span>
        <Button onClick={this.openModal}
                bsStyle={this.props.create ? 'success' : 'info'}
                bsSize={this.props.create ? 'small' : 'xsmall'}>
          {this.props.create ? 'Create Configuration' : 'Edit'}
        </Button>
        <BootstrapModalForm ref="modal"
                            title={`${this.props.create ? 'Create' : 'Edit'} Configuration ${this.state.name}`}
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
            <Input id={this._getId('select-backend')}
                   label="Backend"
                   help="Choose the backend this configuration will be made for">
              <Select options={this._formatBackendOptions()}
                      value={this.state.selectedBackend}
                      onChange={this._changeBackendDropdown}
                      placeholder="Backend" />
            </Input>
          </fieldset>
        </BootstrapModalForm>
      </span>
    );
  },
});

export default EditConfigurationModal;
