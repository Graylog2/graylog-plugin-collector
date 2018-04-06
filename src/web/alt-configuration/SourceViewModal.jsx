import PropTypes from 'prop-types';
import React from 'react';

import { Button, Modal } from 'react-bootstrap';

import BootstrapModalWrapper from 'components/bootstrap/BootstrapModalWrapper';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';

const SourceViewModal = React.createClass({
  propTypes: {
    configurationId: PropTypes.string.isRequired,
    preview: PropTypes.bool,
  },

  getInitialState() {
    return {
      source: undefined,
      name: undefined,
    };
  },

  open() {
    this._loadConfiguration();
    this.sourceModal.open();
  },

  hide() {
    this.sourceModal.close();
  },

  _loadConfiguration() {
    if (this.props.preview === true) {
      CollectorConfigurationsActions.renderPreview(this.props.configurationId)
        .then((response) => {
          this.setState({ source: response.preview, name: 'preview' });
        });
    } else {
      CollectorConfigurationsActions.getConfiguration(this.props.configurationId)
        .then((configuration) => {
          this.setState({ source: configuration.snippets[0].snippet, name: configuration.name });
        });
    }
  },

  render() {
    return (
      <BootstrapModalWrapper ref={(c) => { this.sourceModal = c; }}>
        <Modal.Header closeButton>
          <Modal.Title><span>Configuration <em>{this.state.name}</em></span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="configuration">
            <pre>
              {this.state.source}
            </pre>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={this.hide}>Close</Button>
        </Modal.Footer>
      </BootstrapModalWrapper>
    );
  },
});

export default SourceViewModal;
