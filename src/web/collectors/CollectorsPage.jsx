import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocsHelper from 'util/DocsHelper';

import { DocumentTitle, PageHeader } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import Routes from 'routing/Routes';

import CollectorList from './CollectorsList';

class CollectorsPage extends React.Component {
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
              Read more about collectors and how to set them up in the
              {' '}<DocumentationLink page={DocsHelper.PAGES.COLLECTOR} text="Graylog documentation" />.
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
