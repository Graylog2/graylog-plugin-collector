import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';

import SidecarsActions from 'sidecars/SidecarsActions';

const SidecarsRestartButton = React.createClass({
  propTypes: {
    sidecar: PropTypes.object.isRequired,
    collector: PropTypes.string.isRequired,
  },

  getInitialState() {
    return {
      disabled: false,
    };
  },

  componentDidMount() {
    this.interval = setInterval(this._refreshButtonState, this.BUTTON_REFRESH);
  },

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  BUTTON_REFRESH: 2 * 1000,

  _handleRestart() {
    if (window.confirm('You are about to restart the collector process. Are you sure?')) {
      SidecarsActions.restartCollector.triggerPromise(this.props.sidecar.id, this.props.collector).then(this._disableButton);
    }
  },

  _disableButton() {
    this.setState({ disabled: true });
  },

  _resetButton(actions) {
    let reset = true;
    if (actions) {
      actions.forEach((action) => {
        if (action.collector === this.props.collector && action.properties.restart === true) {
          reset = false;
        }
      });
    }
    if (reset) {
      this.setState({ disabled: false });
    }
  },

  _refreshButtonState() {
    if (this.state.disabled) {
      SidecarsActions.getSidecarActions.triggerPromise(this.props.sidecar.id).then(this._resetButton);
    }
  },

  render() {
    return (
      <Button bsStyle="danger" bsSize="xsmall" disabled={this.state.disabled} onClick={this._handleRestart}>
        Restart
      </Button>
    );
  },
});

export default SidecarsRestartButton;
