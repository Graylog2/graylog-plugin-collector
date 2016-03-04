import React from 'react';
import { Button } from 'react-bootstrap';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { IfPermitted, ISODurationInput } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';

import style from '!style!css!components/configurations/ConfigurationStyles.css';

const CollectorSystemConfiguration = React.createClass({
  propTypes: {
    config: React.PropTypes.shape({
      collector_expiration_threshold: React.PropTypes.string,
      collector_inactive_threshold: React.PropTypes.string,
    }),
    updateConfig: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      config: {
        collector_expiration_threshold: 'P14D',
        collector_inactive_threshold: 'PT1M',
      },
    };
  },

  getInitialState() {
    return {
      config: ObjectUtils.clone(this.props.config),
    };
  },

  componentWillReceiveProps(newProps) {
    this.setState({config: ObjectUtils.clone(newProps.config)});
  },

  _openModal() {
    this.refs.configModal.open();
  },

  _closeModal() {
    this.refs.configModal.close();
  },

  _resetConfig() {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.getInitialState());
  },

  _saveConfig() {
    this.props.updateConfig(this.state.config).then(() => {
      this._closeModal();
    });
  },

  _onUpdate(field) {
    return (value) => {
      const update = ObjectUtils.clone(this.state.config);
      update[field] = value;
      this.setState({config: update});
    };
  },

  render() {
    return (
      <div>
        <h3>Collectors System</h3>

        <dl className={style.deflist}>
          <dt>Inactive threshold:</dt>
          <dd>{this.state.config.collector_inactive_threshold}</dd>
          <dt>Expiration threshold:</dt>
          <dd>{this.state.config.collector_expiration_threshold}</dd>
        </dl>

        <IfPermitted permissions="clusterconfigentry:edit">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>Update</Button>
        </IfPermitted>

        <BootstrapModalForm ref="configModal"
                            title="Update Collectors System Configuration"
                            onSubmitForm={this._saveConfig}
                            onModalClose={this._resetConfig}
                            submitButtonText="Save">
          <fieldset>
            <ISODurationInput duration={this.state.config.collector_inactive_threshold}
                              update={this._onUpdate('collector_inactive_threshold')}
                              label="Inactive threshold (as ISO8601 Duration)"
                              help="Amount of time of inactivity after which collectors are flagged as inactive."
                              validator={(milliseconds) => milliseconds >= 1000}
                              errorText="invalid (min: 1 second)"
                              required />

            <ISODurationInput duration={this.state.config.collector_expiration_threshold}
                              update={this._onUpdate('collector_expiration_threshold')}
                              label="Expiration threshold (as ISO8601 Duration)"
                              help="Amount of time after which inactive collectors are purged from the database."
                              validator={(milliseconds) => milliseconds >= 60 * 1000}
                              errorText="invalid (min: 1 minute)"
                              required />
          </fieldset>
        </BootstrapModalForm>
      </div>
    );
  },
});

export default CollectorSystemConfiguration;
