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

import DocsHelper from 'util/DocsHelper';
import { Row, Col, Button } from 'components/bootstrap';
import { DocumentTitle, PageHeader } from 'components/common';

import ConfigurationsList from './ConfigurationsList';
import CollectorsPageNavigation from '../collectors/CollectorsPageNavigation';

const LifecycleMessage = () => (
  <span>The Graylog Collector plugin is discontinued and has been superseded by the new Sidecars.</span>
);

const ConfigurationsPage = () => (
  <DocumentTitle title="Collector sidecar configurations">
    <CollectorsPageNavigation />
    <PageHeader title="Collector Sidecar Configurations"
                lifecycle="legacy"
                lifecycleMessage={<LifecycleMessage />}
                documentationLink={{
                  title: 'Sidecar documentation',
                  path: DocsHelper.PAGES.COLLECTOR_SIDECAR,
                }}>
      <span>
        The Collector Sidecar runs next to your favourite log collector and configures it for you. Here you can
        manage the Sidecar configurations.
      </span>
    </PageHeader>

    <Row className="content">
      <Col md={12}>
        <ConfigurationsList />
      </Col>
    </Row>
  </DocumentTitle>
);

export default ConfigurationsPage;
