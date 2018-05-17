import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
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

  formatNodeDetails(details) {
    if (!details) {
      return <p>Node details are currently unavailable. Please wait a moment and ensure the sidecar is correctly connected to the server.</p>;
    }
    const collectors = Object.keys(details.status.backends);
    return (
      <dl className="deflist top-margin">
        <dt>IP Address</dt>
        <dd>{details.ip}</dd>
        <dt>Operating System</dt>
        <dd>{details.operating_system}</dd>
        <dt>CPU Idle</dt>
        <dd>{lodash.isNumber(details.metrics.cpu_idle) ? `${details.metrics.cpu_idle}%` : 'Not available' }</dd>
        <dt>Load</dt>
        <dd>{lodash.defaultTo(details.metrics.load_1, 'Not available')}</dd>
        <dt>Volumes &gt; 75% full</dt>
        <dd>{details.metrics.disks_75.length > 0 ? details.metrics.disks_75.join(', ') : 'None'}</dd>
        <dt>Configured collectors</dt>
        <dd>{collectors.length > 0 ? collectors : 'None'}</dd>
      </dl>
    );
  },

  render() {
    const sidecar = this.props.sidecar;

    const logFileList = sidecar.node_details.log_file_list || [];

    return (
      <div>
        <Row className="content" key="sidecar-status">
          <Col md={12}>
            <h2>Node details</h2>
            {this.formatNodeDetails(sidecar.node_details)}
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
