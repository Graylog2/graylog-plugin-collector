import React from 'react';

import { Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocsHelper from 'util/DocsHelper';

import PageHeader from 'components/common/PageHeader';
import CollectorList from './CollectorsList';
import DocumentationLink from 'components/support/DocumentationLink';

const CollectorsPage = React.createClass({
  render() {
    return (
      <span>
        <PageHeader title="Collectors in Cluster">
          <span>
            The Graylog collectors can reliably forward contents of log files or Windows EventLog from your servers.
          </span>

          <span>
            Read more about collectors and how to set them up in the
            {' '}<DocumentationLink page={DocsHelper.PAGES.COLLECTOR} text="Graylog documentation" />.
          </span>

          <span>
            <LinkContainer to={'/system/collectors/configurations/'}>
              <Button bsStyle="info">Manage configurations</Button>
            </LinkContainer>
          </span>
        </PageHeader>

        <Row className="content">
          <Col md={12}>
            <CollectorList />
          </Col>
        </Row>
      </span>
    );
  },
});

export default CollectorsPage;
