import React from 'react';
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DocumentTitle, PageHeader } from 'components/common';
import Routes from 'routing/Routes';

import ConfigurationForm from 'alt-configuration/ConfigurationForm';
import ConfigurationHelper from 'alt-configuration/ConfigurationHelper';

const NewConfigurationPage = React.createClass({
  componentDidMount() {
    this.style.use();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/SidecarStyles.css'),

  render() {
    return (
      <DocumentTitle title="New Collector Configuration">
        <span>
          <PageHeader title="New Collector Configuration">
            <span>
              Some words about collector configurations.
            </span>

            <span>
              Read more about the Graylog Sidecar in the documentation.
            </span>

            <ButtonToolbar>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS')}>
                <Button bsStyle="info">Overview</Button>
              </LinkContainer>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_ADMINISTRATION')}>
                <Button bsStyle="info">Administration</Button>
              </LinkContainer>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_CONFIGURATION')}>
                <Button bsStyle="info" className="active">Configuration</Button>
              </LinkContainer>
            </ButtonToolbar>
          </PageHeader>

          <Row className="content">
            <Col md={6}>
              <ConfigurationForm action="create" />
            </Col>
            <Col md={6}>
              <ConfigurationHelper type="filebeat" />
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default NewConfigurationPage;
