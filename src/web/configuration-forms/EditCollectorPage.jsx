import PropTypes from 'prop-types';
import React from 'react';
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import Routes from 'routing/Routes';

import CollectorsActions from 'configurations/CollectorsActions';
import CollectorForm from 'configuration-forms/CollectorForm';

const EditCollectorPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      collector: undefined,
    };
  },

  componentDidMount() {
    this.style.use();
    this._reloadCollector();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/SidecarStyles.css'),

  _reloadCollector() {
    CollectorsActions.getCollector(this.props.params.id).then(this._setCollector);
  },

  _setCollector(collector) {
    this.setState({ collector });
  },

  _isLoading() {
    return !(this.state.collector);
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title="Log Collector">
        <span>
          <PageHeader title="Log Collector">
            <span>
              Some words about log collectors.
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
              <CollectorForm action="edit" collector={this.state.collector} />
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default EditCollectorPage;