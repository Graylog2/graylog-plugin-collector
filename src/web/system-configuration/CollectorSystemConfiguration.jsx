import React from 'react';
import { Button } from 'react-bootstrap';
import { BootstrapModalForm, Input } from 'components/bootstrap';
import { IfPermitted, ISODurationInput } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';
import ISODurationUtils from 'util/ISODurationUtils';
import FormUtils from 'util/FormsUtils';
import StringUtils from 'util/StringUtils';

const CollectorSystemConfiguration = React.createClass({
  propTypes: {
    config: React.PropTypes.shape({
      collector_expiration_threshold: React.PropTypes.string,
      collector_inactive_threshold: React.PropTypes.string,
      collector_update_interval: React.PropTypes.string,
      collector_send_status: React.PropTypes.bool,
      collector_configuration_override: React.PropTypes.bool,
    }),
    updateConfig: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      config: {
        collector_expiration_threshold: 'P14D',
        collector_inactive_threshold: 'PT1M',
        collector_update_interval: 'PT30S',
        collector_send_status: true,
        collector_configuration_override: false,
      },
    };
  },

  getInitialState() {
    return {
      config: ObjectUtils.clone(this.props.config),
    };
  },

  componentWillReceiveProps(newProps) {
    this.setState({ config: ObjectUtils.clone(newProps.config) });
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
      if (typeof value === 'object') {
        update[field] = FormUtils.getValueFromInput(value.target);
      } else {
        update[field] = value;
      }
      this.setState({ config: update });
    };
  },

  _inactiveThresholdValidator(milliseconds) {
    return milliseconds >= 1000;
  },

  _expirationThresholdValidator(milliseconds) {
    return milliseconds >= 60 * 1000;
  },

  _updateIntervalValidator(milliseconds) {
    const inactiveMilliseconds = this._durationMilliseconds(this.state.config.collector_inactive_threshold);
    const expirationMilliseconds = this._durationMilliseconds(this.state.config.collector_expiration_threshold);
    return milliseconds >= 1000 && milliseconds < inactiveMilliseconds && milliseconds < expirationMilliseconds;
  },

  _durationMilliseconds(duration) {
    return ISODurationUtils.isValidDuration(duration, (milliseconds) => { return milliseconds; });
  },

  render() {
    return (
      <div>
        <h3>Collectors System</h3>

        <dl className="deflist">
          <dt>Inactive threshold:</dt>
          <dd>{this.state.config.collector_inactive_threshold}</dd>
          <dt>Expiration threshold:</dt>
          <dd>{this.state.config.collector_expiration_threshold}</dd>
          <dt>Update interval:</dt>
          <dd>{this.state.config.collector_update_interval}</dd>
          <dt>Send status:</dt>
          <dd>{StringUtils.capitalizeFirstLetter(this.state.config.collector_send_status.toString())}</dd>
          <dt>Override configuration:</dt>
          <dd>{StringUtils.capitalizeFirstLetter(this.state.config.collector_configuration_override.toString())}</dd>
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
                              validator={this._inactiveThresholdValidator}
                              errorText="invalid (min: 1 second)"
                              required />

            <ISODurationInput duration={this.state.config.collector_expiration_threshold}
                              update={this._onUpdate('collector_expiration_threshold')}
                              label="Expiration threshold (as ISO8601 Duration)"
                              help="Amount of time after which inactive collectors are purged from the database."
                              validator={this._expirationThresholdValidator}
                              errorText="invalid (min: 1 minute)"
                              required />
            <ISODurationInput duration={this.state.config.collector_update_interval}
                              update={this._onUpdate('collector_update_interval')}
                              label="Update interval (as ISO8601 Duration)"
                              help="Time between collector update requests."
                              validator={this._updateIntervalValidator}
                              errorText="invalid (min: 1 second, lower: inactive/expiration threshold)"
                              required />
          </fieldset>
          <Input type="checkbox"
                 label="Send status updates"
                 checked={this.state.config.collector_send_status}
                 onChange={this._onUpdate('collector_send_status')}
                 help="Send collector status and host metrics from each client" />
          <Input type="checkbox"
                 label="Override Sidecar configuration"
                 checked={this.state.config.collector_configuration_override}
                 onChange={this._onUpdate('collector_configuration_override')}
                 help="Override configuration file settings for all Sidecars" />
        </BootstrapModalForm>
      </div>
    );
  },
});

export default CollectorSystemConfiguration;
