import React from 'react';
import { Link } from 'react-router';

import { Alert, Button, Modal } from 'components/graylog';
import BootstrapModalWrapper from 'components/bootstrap/BootstrapModalWrapper';
import Routes from 'routing/Routes';

class ImportsHelperModal extends React.Component {
  open = () => {
    this.importsHelperModal.open();
  };

  hide = () => {
    this.importsHelperModal.close();
  };

  render() {
    return (
      <BootstrapModalWrapper ref={(c) => { this.importsHelperModal = c; }}>
        <Modal.Header closeButton>
          <Modal.Title><span>Configuration Import</span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert bsStyle="info">
            <i className="fa fa-info-circle" />&nbsp;
            Configuration was imported successfully, continue with the new <Link to={Routes.SYSTEM.SIDECARS.CONFIGURATION}>Sidecar Configurations</Link> and use it as a base to create new configurations.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={this.hide}>Close</Button>
        </Modal.Footer>
      </BootstrapModalWrapper>
    );
  }
}

export default ImportsHelperModal;
