import React from 'react';

import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocsHelper from 'util/DocsHelper';

import { DocumentTitle, PageHeader } from 'components/common';
import CollectorList from './CollectorsList';
import DocumentationLink from 'components/support/DocumentationLink';

import Routes from 'routing/Routes';

const CollectorsPage = React.createClass({
  render() {
    return (
      <DocumentTitle title="Collectors">
        <span>
          <PageHeader title="Collectors Overview">
            <span>
              The Graylog collectors can reliably forward contents of log files or Windows EventLog from your servers.
            </span>

            <span>
              Read more about collectors and how to set them up in the
              {' '}<DocumentationLink page={DocsHelper.PAGES.COLLECTOR} text="Graylog documentation" />.
            </span>

            <ButtonToolbar>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS')}>
                <Button bsStyle="info" className="active">Overview</Button>
              </LinkContainer>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_ADMINISTRATION')}>
                <Button bsStyle="info">Administration</Button>
              </LinkContainer>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_CONFIGURATION')}>
                <Button bsStyle="info">Configuration</Button>
              </LinkContainer>
            </ButtonToolbar>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <CollectorList />
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default CollectorsPage;
