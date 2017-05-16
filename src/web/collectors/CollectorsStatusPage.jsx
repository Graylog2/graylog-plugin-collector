import React from 'react';

import { Alert, Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import StringUtils from 'util/StringUtils';
import DocsHelper from 'util/DocsHelper';
import DocumentationLink from 'components/support/DocumentationLink';

import CollectorsActions from 'collectors/CollectorsActions';
import CollectorsStatusFileList from 'collectors/CollectorsStatusFileList';
import CollectorsRestartButton from 'collectors/CollectorsRestartButton';

import Routes from 'routing/Routes';

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
    this.style.use();
    this._reloadCollector();
    this.interval = setInterval(this._reloadCollector, 5000);
  },

  componentWillUnmount() {
    this.style.unuse();
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  style: require('!style/useable!css!styles/CollectorStyles.css'),

  _reloadCollector() {
    CollectorsActions.getCollector.triggerPromise(this.props.params.id).then(this._setCollector);
  },

  _setCollector(collector) {
    this.setState({ collector });
  },

  _isLoading() {
    return !this.state.collector;
  },

  _formatSystemStats(stats) {
    if (stats && stats.disks_75 && stats.load_1 >= -1 && stats.cpu_idle >= -1) {
      const volumes = stats.disks_75.map((volume) => <dd key={volume}>{volume}</dd>);
      const statsFormatted = [];
      statsFormatted.push(
        <dt key="cpu-idle-title">CPU Idle:</dt>,
        <dd key="cpu-idle-description">{stats.cpu_idle}%</dd>
      );
      if (stats.load_1 >= 0) {
        statsFormatted.push(
          <dt key="load-title">Load:</dt>,
          <dd key="load-description">{stats.load_1}</dd>
        );
      }
      statsFormatted.push(
        <dt key="disk-title">Volumes > 75%:</dt>,
        volumes
      );

      return (<div><dl className="deflist">{statsFormatted}</dl></div>)
    }
  },

  _formatConfiguration(configuration) {
    if (configuration && configuration.tags && configuration.ip) {
      const tags = configuration.tags.join(", ");
      return (
        <div>
          <dl className="deflist">
            <dt>Tags:</dt>
            <dd>{tags}</dd>
            <dt>IP:</dt>
            <dd>{configuration.ip}</dd>
          </dl>
        </div>
      )
    }
  },

  _formatStatus(name, item) {
    let restart = null;
    if (name !== 'Status' && this.state.collector) {
      restart = (<div className="pull-right">
        <CollectorsRestartButton collector={this.state.collector} backend={name}/>
      </div>);
    }

    if (item) {
      switch (item.status) {
        case 0:
          return (
            <Alert bsStyle="success" style={{ marginTop: '10' }} key={`status-alert-${name}`}>
              <i className="fa fa-check-circle"/> &nbsp;<i>{StringUtils.capitalizeFirstLetter(name)}</i>: {item.message}
              {restart}
            </Alert>);
        case 1:
          return (
            <Alert bsStyle="warning" style={{ marginTop: '10' }} key={`status-alert-${name}`}>
              <i className="fa fa-cog"/> &nbsp;<i>{StringUtils.capitalizeFirstLetter(name)}</i>: {item.message}
              {restart}
            </Alert>);
        case 2:
          return (
            <Alert bsStyle="danger" style={{ marginTop: '10' }} key={`status-alert-${name}`}>
              <i className="fa fa-wrench"/> &nbsp;<i>{StringUtils.capitalizeFirstLetter(name)}</i>: {item.message}
              {restart}
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
      return <DocumentTitle title="Collector status"><Spinner /></DocumentTitle>;
    }

    var backends = [];
    if (this.state.collector.node_details.status) {
      backends = this.state.collector.node_details.status.backends;
    }
    const backendStates = Object.keys(backends).map((key) => {
      return this._formatStatus(key, backends[key]);
    });
    const logFileList = this.state.collector.node_details.log_file_list || [];

    return (
      <DocumentTitle title={`Collector status ${this.state.collector.node_id}`}>
        <span>
          <PageHeader title={<span>Collector Status <em>{this.state.collector.node_id}</em></span>}>
            <span>
              A status overview of all running collector backends on this host.
            </span>

            <span>
              Read more about collectors and how to set them up in the
              {' '}<DocumentationLink page={DocsHelper.PAGES.COLLECTOR_STATUS} text="Graylog documentation"/>.
            </span>

            <span>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS')}>
                <Button bsStyle="info active">Overview</Button>
              </LinkContainer>
              &nbsp;
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_CONFIGURATIONS')}>
                <Button bsStyle="info">Manage Configurations</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          <Row className="content" key="sidecar-status">
            <Col md={12}>
              <h2>Sidecar</h2>
                <div className="top-margin">
                  <Row>
                    <Col md={6}>
                      {this._formatConfiguration(this.state.collector.node_details)}
                    </Col>
                    <Col md={6}>
                      {this._formatSystemStats(this.state.collector.node_details.metrics)}
                    </Col>
                  </Row>
                  <hr className="separator"/>
                </div>
              {this._formatStatus("Status", this.state.collector.node_details.status)}
            </Col>
          </Row>
          <Row className="content" key="backend-status" hidden={backendStates.length === 0}>
            <Col md={12}>
              <h2>Backends</h2>
              {backendStates}
            </Col>
          </Row>
          <Row className="content" key="log-file-list" hidden={logFileList.length === 0}>
            <Col md={12}>
              <h2>Log Files</h2>
              <p>Recently modified files will be highlighted in blue.</p>
              <div className="top-margin">
                <CollectorsStatusFileList files={logFileList}/>
              </div>
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default CollectorsStatusPage;
