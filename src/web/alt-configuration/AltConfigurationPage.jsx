import PropTypes from 'prop-types';
import React from 'react';
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import Routes from 'routing/Routes';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';

import AltConfigurationForm from 'alt-configuration/AltConfigurationForm';
import ConfigurationHelper from 'alt-configuration/ConfigurationHelper';

const AltConfigurationPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      configuration: undefined,
    };
  },

  componentDidMount() {
    this.style.use();
    this._reloadConfiguration();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/SidecarStyles.css'),

  _reloadConfiguration() {
    CollectorConfigurationsActions.getConfiguration.triggerPromise(this.props.params.id).then(this._setConfiguration);
  },

  _setConfiguration(configuration) {
    this.setState({ configuration });
  },

  _isLoading() {
    return !(this.state.configuration);
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title="Collector Configuration">
        <span>
          <PageHeader title="Collector Configuration">
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
              <AltConfigurationForm configuration={this.state.configuration} />
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

export default AltConfigurationPage;
