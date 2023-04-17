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
import createReactClass from 'create-react-class';

import { Button } from 'components/bootstrap';
import { BootstrapModalForm, Input } from 'components/bootstrap';
import ObjectUtils from 'util/ObjectUtils';

const EditConfigurationModal = createReactClass({
  displayName: 'EditConfigurationModal',

  propTypes: {
    configuration: PropTypes.object,
    create: PropTypes.bool,
    updateConfiguration: PropTypes.func.isRequired,
    validConfigurationName: PropTypes.func.isRequired,
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
      showModal: false,
    };
  },

  openModal() {
    this.setState({ showModal: true });
  },

  _closeModal() {
    this.setState({ showModal: false });
  },

  _getId(prefixIdName) {
    return prefixIdName + this.state.configuration.name;
  },

  _saved() {
    this._closeModal();
    this.setState(this.getInitialState());
  },

  _save() {
    const { configuration } = this.state;

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
        <BootstrapModalForm show={this.state.showModal}
                            onCancel={this._closeModal}
                            title={`${this.props.create ? 'Create' : 'Edit'} Configuration ${this.state.configuration.name}`}
                            data-telemetry-title={`${this.props.create ? 'Create' : 'Edit'} Configuration`}
                            onSubmitForm={this._save}
                            submitButtonText={`${this.props.create ? 'Create' : 'Update'} configuration`}>
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
