import PropTypes from 'prop-types';
import React from 'react';
import { MenuItem } from 'react-bootstrap';

import { BootstrapModalForm, Input } from 'components/bootstrap';

import style from './CopyConfigurationModal.css';

const CopyConfigurationModal = React.createClass({
  propTypes: {
    id: PropTypes.string,
    copyConfiguration: PropTypes.func.isRequired,
    validConfigurationName: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      id: '',
      name: '',
    };
  },

  getInitialState() {
    return {
      id: this.props.id,
      name: '',
      error: false,
      error_message: '',
    };
  },

  openModal() {
    this.refs.modal.open();
  },

  _getId(prefixIdName) {
    return `${prefixIdName}-${this.props.id}`;
  },

  _closeModal() {
    this.refs.modal.close();
  },

  _saved() {
    this._closeModal();
    this.setState({ name: '' });
  },

  _save() {
    const configuration = this.state;

    if (!configuration.error) {
      this.props.copyConfiguration(this.props.id, this.state.name, this._saved);
    }
  },

  _changeName(event) {
    this.setState({ name: event.target.value });
  },

  render() {
    return (
      <span>
        <MenuItem className={style.menuItem} onSelect={this.openModal}>Clone</MenuItem>
        <BootstrapModalForm ref="modal"
                            title="Clone"
                            onSubmitForm={this._save}
                            submitButtonText="Create">
          <fieldset>
            <Input type="text"
                   id={this._getId('configuration-name')}
                   label="Name"
                   defaultValue={this.state.name}
                   onChange={this._changeName}
                   bsStyle={this.state.error ? 'error' : null}
                   help={this.state.error ? this.state.error_message : 'Type a name for the new configuration'}
                   autoFocus
                   required />
          </fieldset>
        </BootstrapModalForm>
      </span>
    );
  },
});

export default CopyConfigurationModal;
