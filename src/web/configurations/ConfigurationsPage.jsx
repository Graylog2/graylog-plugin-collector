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
import { LinkContainer } from 'components/graylog/router';

import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';
import { Row, Col, Button } from 'components/graylog';
import DocumentationLink from 'components/support/DocumentationLink';
import { DocumentTitle, PageHeader } from 'components/common';

import ConfigurationsList from './ConfigurationsList';


class ConfigurationsPage extends React.Component {
  render() {
    const lifecycleMessage = (
      <span>The Graylog Collector plugin is discontinued and has been superseded by the new Sidecars.</span>
    );

    return (
      <DocumentTitle title="Collector sidecar configurations">
        <span>
          <PageHeader title="Collector Sidecar Configurations"
                      lifecycle="legacy"
                      lifecycleMessage={lifecycleMessage}>
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
                <Button bsStyle="info" className="active">Manage Configurations</Button>
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
  }
}

export default ConfigurationsPage;
