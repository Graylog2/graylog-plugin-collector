import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Alert, Col, Row } from 'react-bootstrap';

import SidecarsStatusFileList from 'sidecars/SidecarsStatusFileList';
import SidecarsRestartButton from 'sidecars/SidecarsRestartButton';

const SidecarStatus = createReactClass({
  propTypes: {
    sidecar: PropTypes.object.isRequired,
  },

  componentDidMount() {
    this.style.use();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/SidecarStyles.css'),

  formatSystemStats(stats) {
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

  formatConfiguration(configuration) {
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

  formatStatus(sidecar, name, item) {
    let restart = null;
    if (name !== 'Status' && sidecar) {
      restart = (<div className="pull-right">
        <SidecarsRestartButton sidecar={sidecar} collector={name}/>
      </div>);
    }

    if (item) {
      switch (item.status) {
        case 0:
          return (
            <Alert bsStyle="success" style={{ marginTop: '10' }} key={`status-alert-${name}`}>
              <i className="fa fa-check-circle"/> &nbsp;<i>{lodash.capitalize(name)}</i>: {item.message}
              {restart}
            </Alert>);
        case 1:
          return (
            <Alert bsStyle="warning" style={{ marginTop: '10' }} key={`status-alert-${name}`}>
              <i className="fa fa-cog"/> &nbsp;<i>{lodash.capitalize(name)}</i>: {item.message}
              {restart}
            </Alert>);
        case 2:
          return (
            <Alert bsStyle="danger" style={{ marginTop: '10' }} key={`status-alert-${name}`}>
              <i className="fa fa-wrench"/> &nbsp;<i>{lodash.capitalize(name)}</i>: {item.message}
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
    const sidecar = this.props.sidecar;

    let collectors = [];
    if (sidecar.node_details.status) {
      collectors = sidecar.node_details.status.backends;
    }

    const collectorStates = Object.keys(collectors).map((key) => {
      return this.formatStatus(sidecar, key, collectors[key]);
    });
    const logFileList = sidecar.node_details.log_file_list || [];

    return (
      <div>
        <Row className="content" key="sidecar-status">
          <Col md={12}>
            <h2>Sidecar</h2>
            <div className="top-margin">
              <Row>
                <Col md={6}>
                  {this.formatConfiguration(sidecar.node_details)}
                </Col>
                <Col md={6}>
                  {this.formatSystemStats(sidecar.node_details.metrics)}
                </Col>
              </Row>
              <hr className="separator" />
            </div>
            {this.formatStatus(sidecar, "Status", sidecar.node_details.status)}
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
              <SidecarsStatusFileList files={logFileList} />
            </div>
          </Col>
        </Row>
      </div>
    );
  },

});

export default SidecarStatus;
