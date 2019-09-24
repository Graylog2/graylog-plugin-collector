import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';

import { Button } from 'components/graylog';
import CollectorsActions from 'collectors/CollectorsActions';

const CollectorsImportButton = createReactClass({
  propTypes: {
    collector: PropTypes.object.isRequired,
    backend: PropTypes.string.isRequired,
    onFinish: PropTypes.func,
  },

  getDefaultProps() {
    return {
      onFinish: () => null,
    };
  },

  getInitialState() {
    return {
      disabled: false,
      text: this.BUTTON_DEFAULT_TEXT,
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

  BUTTON_DEFAULT_TEXT: 'Import Configuration',
  BUTTON_REFRESH: 2 * 1000,

  _handleImport() {
    CollectorsActions.importCollectorConfiguration(this.props.collector.id, this.props.backend).then(this._disableButton);
  },

  _disableButton() {
    this.setState({ disabled: true, text: 'Importing...' });
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
      this.setState({ disabled: false, text: this.BUTTON_DEFAULT_TEXT });
      this.props.onFinish();
    }
  },

  _refreshButtonState() {
    if (this.state.disabled) {
      CollectorsActions.getCollectorActions(this.props.collector.id).then(this._resetButton);
    }
  },

  render() {
    return (
      <Button bsStyle="info" bsSize="xsmall" disabled={this.state.disabled} onClick={this._handleImport}>
        {this.state.text}
      </Button>
    );
  },
});

export default CollectorsImportButton;
