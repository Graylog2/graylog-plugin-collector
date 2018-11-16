import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Button } from 'react-bootstrap';

import CollectorsActions from 'collectors/CollectorsActions';

const CollectorsImportButton = createReactClass({
  displayName: 'CollectorsImportButton',

  propTypes: {
    collector: PropTypes.object.isRequired,
    backend: PropTypes.string.isRequired,
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

  _handleImport() {
    CollectorsActions.importCollectorConfiguration.triggerPromise(this.props.collector.id, this.props.backend).then(this._disableButton);
  },

  _disableButton() {
    this.setState({ disabled: true });
  },

  _resetButton(actions) {
    let reset = true;
    if (actions) {
      actions.forEach((action) => {
        if (action.backend === this.props.backend && action.properties.import === true) {
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
      <Button bsStyle="info" bsSize="xsmall" disabled={this.state.disabled} onClick={this._handleImport}>
        Import Configuration
      </Button>
    );
  },
});

export default CollectorsImportButton;
