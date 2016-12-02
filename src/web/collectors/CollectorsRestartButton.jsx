import React from 'react';
import { Button } from 'react-bootstrap';

import CollectorsActions from 'collectors/CollectorsActions';

const CollectorsRestartButton = React.createClass({
  propTypes: {
    collector: React.PropTypes.object.isRequired,
    backend: React.PropTypes.string.isRequired,
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
      CollectorsActions.restartCollectorBackend.triggerPromise(this.props.collector.id, this.props.backend).then(this._disableButton);
    }
  },

  _disableButton() {
    this.setState({ disabled: true });
  },

  _resetButton(actions) {
    let reset = true;
    if (actions) {
      actions.forEach((action) => {
        if (action.backend === this.props.backend && action.properties.restart === true) {
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
      CollectorsActions.getCollectorActions.triggerPromise(this.props.collector.id).then(this._resetButton);
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

export default CollectorsRestartButton;
