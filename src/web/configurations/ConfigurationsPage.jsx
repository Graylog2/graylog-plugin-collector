import React from 'react';

import { Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocsHelper from 'util/DocsHelper';
import DocumentationLink from 'components/support/DocumentationLink';

import { DocumentTitle, PageHeader } from 'components/common';
import ConfigurationsList from './ConfigurationsList';

import Routes from 'routing/Routes';

const ConfigurationsPage = React.createClass({
  render() {
    return (
      <DocumentTitle title="Collector sidecar configurations">
        <span>
          <PageHeader title="Collector Sidecar Configurations">
            <span>
              The Collector Sidecar runs next to your favourite log collector and configures it for you. Here you can
              manage the Sidecar configurations.
            </span>

            <span>
              Read more about the collector sidecar in the{' '}
              <DocumentationLink page={DocsHelper.PAGES.COLLECTOR_SIDECAR} text="Graylog documentation" />.
            </span>

            <span>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS')}>
                <Button bsStyle="info">Overview</Button>
              </LinkContainer>
              &nbsp;
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_CONFIGURATIONS')}>
                <Button bsStyle="info active">Manage Configurations</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <ConfigurationsList />
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default ConfigurationsPage;
