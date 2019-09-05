import React from 'react';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

import DocsHelper from 'util/DocsHelper';

import { Button, Col, Modal, Row } from 'components/graylog';
import { DocumentTitle, PageHeader } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import { BootstrapModalWrapper } from 'components/bootstrap';
import Routes from 'routing/Routes';

import CollectorList from './CollectorsList';

import style from './CollectorsPage.css';

class CollectorsPage extends React.Component {
  openModal = () => {
    this.modal.open();
  };

  closeModal = () => {
    this.modal.close();
  };

  renderModal = () => {
    return (
      <BootstrapModalWrapper ref={(modal) => { this.modal = modal; }} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>New Graylog Sidecar</Modal.Title>
        </Modal.Header>
        <Modal.Body className={style.sidecarModal}>
          <p>
            We listened to your feedback and have been working on the new Graylog Sidecar. Here is what you can
            expect from it:
          </p>

          <div>
            <h4>Works with any log collector</h4>
            <p>
              Graylog Sidecar includes support for some popular log collectors out of the box. Now you can also
              add any other log collector that you want to manage through a Sidecar.
            </p>
            <h4>Manage your Sidecars from within the Graylog Web Interface</h4>
            <p>
              Use the Web Interface to get an overview of your Sidecar fleet from your browser. The new administration
              page also lets you manage any Sidecars or Collectors registered into that Graylog instance.
            </p>
            <h4>Use any configuration option</h4>
            <p>
              Write Collector&apos;s Configurations in the Graylog Web Interface as you would do in your favourite
              editor. Do you have common configuration blocks that you want to reuse? You can include any Configuration
              inside another Configuration to avoid duplicating it.
            </p>
            <h4>Content Packs support</h4>
            <p>
              Create and share Content Packs with your Collectors and Configurations, or install Content Packs from
              other community members that will expand your Sidecars with new Collectors.
            </p>
            <h4>Integrated in the product</h4>
            <p>Graylog Sidecar is now included in Graylog, no need to manage any additional plugins.</p>
            <h4>Faster and more robust</h4>
            <p>
              We have also been busy to ensure everything is fast and resilient, so you can have a great experience.
            </p>
          </div>

          <p>
            Do you want to know more about the new Graylog Sidecar? Read the{' '}
            <DocumentationLink page={DocsHelper.PAGES.COLLECTOR_SIDECAR} text="Graylog documentation" /> for more information.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.closeModal}>Close</Button>
          <LinkContainer to={Routes.SYSTEM.SIDECARS.OVERVIEW}><Button bsStyle="primary">Open Sidecars page</Button></LinkContainer>
        </Modal.Footer>
      </BootstrapModalWrapper>
    );
  };

  render() {
    const lifecycleMessage = (
      <span>The Graylog Collector plugin is discontinued and has been superseded by the new Sidecars.</span>
    );

    return (
      <DocumentTitle title="Collectors">
        <span>
          <PageHeader title="Collectors in Cluster"
                      lifecycle="legacy"
                      lifecycleMessage={lifecycleMessage}>
            <span>
              The Graylog collectors can reliably forward contents of log files or Windows EventLog from your servers.
            </span>

            <span>
              There is a new version of Graylog Collector and it is called{' '}
              <Link to={Routes.SYSTEM.SIDECARS.OVERVIEW}>Graylog Sidecar</Link>.&ensp;
              <a href="#sidecarnews" onClick={this.openModal}>What&apos;s new?</a>
            </span>

            <span>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS')}>
                <Button bsStyle="info" className="active">Overview</Button>
              </LinkContainer>
              &nbsp;
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_CONFIGURATIONS')}>
                <Button bsStyle="info">Manage Configurations</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          {this.renderModal()}

          <Row className="content">
            <Col md={12}>
              <CollectorList />
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  }
}

export default CollectorsPage;
