import PropTypes from 'prop-types';
import React from 'react';

import { Alert, Button, ButtonToolbar, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import StringUtils from 'util/StringUtils';
import DocsHelper from 'util/DocsHelper';
import DocumentationLink from 'components/support/DocumentationLink';

import SidecarsActions from 'sidecars/SidecarsActions';
import SidecarsStatusFileList from 'sidecars/SidecarsStatusFileList';
import SidecarsRestartButton from 'sidecars/SidecarsRestartButton';

import Routes from 'routing/Routes';

const SidecarsStatusPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      sidecar: undefined,
    };
  },

  componentDidMount() {
    this.style.use();
    this._reloadSidecar();
    this.interval = setInterval(this._reloadSidecar, 5000);
  },

  componentWillUnmount() {
    this.style.unuse();
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  style: require('!style/useable!css!styles/SidecarStyles.css'),

  _reloadSidecar() {
    SidecarsActions.getSidecar.triggerPromise(this.props.params.id).then(this._setSidecar);
  },

  _setSidecar(sidecar) {
    this.setState({ sidecar });
  },

  _isLoading() {
    return !this.state.sidecar;
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
    if (name !== 'Status' && this.state.sidecar) {
      restart = (<div className="pull-right">
        <SidecarsRestartButton sidecar={this.state.sidecar} collector={name}/>
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
          <i className="fa fa-cog"/> &nbsp;<i>Sidecar</i>: no status information found
        </Alert>);
    }

  },

  render() {
    if (this._isLoading()) {
      return <DocumentTitle title="Sidecar status"><Spinner /></DocumentTitle>;
    }

    var collectors = [];
    if (this.state.sidecar.node_details.status) {
      collectors = this.state.sidecar.node_details.status.collectors;
    }
    const collectorStates = Object.keys(collectors).map((key) => {
      return this._formatStatus(key, collectors[key]);
    });
    const logFileList = this.state.sidecar.node_details.log_file_list || [];

    return (
      <DocumentTitle title={`Sidecar status ${this.state.sidecar.node_id}`}>
        <span>
          <PageHeader title={<span>Sidecar Status <em>{this.state.sidecar.node_id}</em></span>}>
            <span>
              A status overview of all running sidecar collectors on this host.
            </span>

            <span>
              Read more about sidecars and how to set them up in the
              {' '}<DocumentationLink page={DocsHelper.PAGES.COLLECTOR_STATUS} text="Graylog documentation"/>.
            </span>

            <ButtonToolbar>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS')}>
                <Button bsStyle="info" className="active">Overview</Button>
              </LinkContainer>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_ADMINISTRATION')}>
                <Button bsStyle="info">Administration</Button>
              </LinkContainer>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_CONFIGURATION')}>
                <Button bsStyle="info">Configuration</Button>
              </LinkContainer>
            </ButtonToolbar>
          </PageHeader>

          <Row className="content" key="sidecar-status">
            <Col md={12}>
              <h2>Sidecar</h2>
                <div className="top-margin">
                  <Row>
                    <Col md={6}>
                      {this._formatConfiguration(this.state.sidecar.node_details)}
                    </Col>
                    <Col md={6}>
                      {this._formatSystemStats(this.state.sidecar.node_details.metrics)}
                    </Col>
                  </Row>
                  <hr className="separator"/>
                </div>
              {this._formatStatus("Status", this.state.sidecar.node_details.status)}
            </Col>
          </Row>
          <Row className="content" key="collector-status" hidden={collectorStates.length === 0}>
            <Col md={12}>
              <h2>Collectors</h2>
              {collectorStates}
            </Col>
          </Row>
          <Row className="content" key="log-file-list" hidden={logFileList.length === 0}>
            <Col md={12}>
              <h2>Log Files</h2>
              <p>Recently modified files will be highlighted in blue.</p>
              <div className="top-margin">
                <SidecarsStatusFileList files={logFileList}/>
              </div>
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default SidecarsStatusPage;
