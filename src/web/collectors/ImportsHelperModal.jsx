/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import React from 'react';
import { Link } from 'components/graylog/router';
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
