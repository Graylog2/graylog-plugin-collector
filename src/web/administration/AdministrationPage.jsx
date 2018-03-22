import React from 'react';
import createReactClass from 'create-react-class';

import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocsHelper from 'util/DocsHelper';

import { DocumentTitle, PageHeader } from 'components/common';
import Routes from 'routing/Routes';
import DocumentationLink from 'components/support/DocumentationLink';

import CollectorsAdministrationContainer from './CollectorsAdministrationContainer';

const AdministrationPage = createReactClass({
  render() {
    return (
      <DocumentTitle title="Collectors Administration">
        <span>
          <PageHeader title="Collectors Administration">
            <span>
              The Graylog collectors can reliably forward contents of log files or Windows EventLog from your servers.
            </span>

            <span>
              Read more about collectors and how to set them up in the
              {' '}<DocumentationLink page={DocsHelper.PAGES.COLLECTOR} text="Graylog documentation" />.
            </span>

            <ButtonToolbar>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS')}>
                <Button bsStyle="info">Overview</Button>
              </LinkContainer>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_ADMINISTRATION')}>
                <Button bsStyle="info" className="active">Administration</Button>
              </LinkContainer>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_CONFIGURATION')}>
                <Button bsStyle="info">Configuration</Button>
              </LinkContainer>
            </ButtonToolbar>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <CollectorsAdministrationContainer />
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default AdministrationPage;
