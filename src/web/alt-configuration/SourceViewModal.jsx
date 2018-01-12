import PropTypes from 'prop-types';
import React from 'react';

import { Button, Modal } from 'react-bootstrap';

import BootstrapModalWrapper from 'components/bootstrap/BootstrapModalWrapper';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';

const SourceViewModal = React.createClass({
  propTypes: {
    configurationId: PropTypes.string.isRequired,
    renderTemplate: PropTypes.boolean,
  },

  getInitialState() {
    return {
      configuration: undefined,
    };
  },

  open() {
    this._loadConfiguration();
    this.refs.sourceModal.open();
  },

  hide() {
    this.refs.sourceModal.close();
  },

  _loadConfiguration() {
    if (this.props.renderTemplate === true) {
      CollectorConfigurationsActions.renderConfiguration(this.props.configurationId)
        .then((configuration) => {
          this.setState( {configuration: configuration} );
        });
    } else {
      CollectorConfigurationsActions.getConfiguration(this.props.configurationId)
        .then((configuration) => {
          this.setState( {configuration: configuration} );
        });
    }
  },

  render() {
    let source;
    let name;
    if (this.state.configuration !== undefined) {
      source = this.state.configuration.snippets[0].snippet;
      name = this.state.configuration.name;
    }
    return (
      <BootstrapModalWrapper ref="sourceModal">
        <Modal.Header closeButton>
          <Modal.Title><span>Configuration <em>{name}</em></span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="configuration">
            <pre>
              {source}
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
