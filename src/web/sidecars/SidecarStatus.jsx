import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';

import SidecarsStatusFileList from 'sidecars/SidecarsStatusFileList';

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

  render() {
    const sidecar = this.props.sidecar;

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
            </div>
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
