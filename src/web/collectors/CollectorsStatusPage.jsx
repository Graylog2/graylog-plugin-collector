import React from 'react';

import { Alert, Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { Spinner } from 'components/common';
import StringUtils from 'util/StringUtils';
import DocsHelper from 'util/DocsHelper';
import PageHeader from 'components/common/PageHeader';
import DocumentationLink from 'components/support/DocumentationLink';

import CollectorsActions from 'collectors/CollectorsActions';

const CollectorsStatusPage = React.createClass({
  propTypes: {
      params: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      collector: undefined,
    };
  },

  componentDidMount() {
    this._reloadCollector();
    this.interval = setInterval(this._reloadCollector, 2000);
  },

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  _reloadCollector() {
    CollectorsActions.getCollector.triggerPromise(this.props.params.id).then(this._setCollector);
  },

  _setCollector(collector) {
    this.setState({ collector });
  },

  _isLoading() {
    return !this.state.collector;
  },

  _formatStatus(name, item) {
    if (item) {
      switch (item.status) {
        case 0:
          return (
            <Alert bsStyle="success" style={{ marginTop: '10' }} key={`status-alert-${name}`}>
              <i className="fa fa-spin fa-cog"/> &nbsp;<i>{StringUtils.capitalizeFirstLetter(name)}</i>: {item.message}
            </Alert>);
        case 1:
          return (
            <Alert bsStyle="warning" style={{ marginTop: '10' }} key={`status-alert-${name}`}>
              <i className="fa fa-cog"/> &nbsp;<i>{StringUtils.capitalizeFirstLetter(name)}</i>: {item.message}
            </Alert>);
        case 2:
          return (
            <Alert bsStyle="danger" style={{ marginTop: '10' }} key={`status-alert-${name}`}>
              <i className="fa fa-wrench"/> &nbsp;<i>{StringUtils.capitalizeFirstLetter(name)}</i>: {item.message}
            </Alert>);
      }
    } else {
      return (
        <Alert bsStyle="warning" style={{ marginTop: '10' }} key={`status-alert`}>
          <i className="fa fa-cog"/> &nbsp;<i>Collector</i>: no status information found
        </Alert>);
    }

  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    var backends = [];
    if (this.state.collector.node_details.status) {
      backends = this.state.collector.node_details.status.backends;
    }
    const backendStates = Object.keys(backends).map((key) => {
      return this._formatStatus(key, backends[key]);
    });

    return (
      <span>
        <PageHeader title={<span>Collector Status <em>{this.state.collector.node_id}</em></span>}>
          <span>
            A status overview of all running collector backends on this host.
          </span>

          <span>
            Read more about collectors and how to set them up in the
            {' '}<DocumentationLink page={DocsHelper.PAGES.COLLECTOR} text="Graylog documentation"/>.
          </span>

          <span>
            <LinkContainer to={'/system/collectors/'}>
              <Button bsStyle="info">Show Collectors</Button>
            </LinkContainer>
          </span>
        </PageHeader>

        <Row className="content" key="sidecar-status">
          <Col md={12}>
            <h2>Sidecar</h2>
            {this._formatStatus("Status", this.state.collector.node_details.status)}
          </Col>
        </Row>
        <Row className="content" key="backend-status" hidden={backendStates.length === 0}>
          <Col md={12}>
            <h2>Backends</h2>
            {backendStates}
          </Col>
        </Row>
      </span>
    );
  },
});

export default CollectorsStatusPage;
