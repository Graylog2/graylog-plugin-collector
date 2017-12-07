import PropTypes from 'prop-types';
import React from 'react';

import ConfigurationHelperStyle from './ConfigurationHelper.css';


const FilebeatHelper = React.createClass({
  propTypes: {
    section: PropTypes.string.isRequired,
    paragraph: PropTypes.string.isRequired,
  },

  logProspector() {
    return (
      <div>
        <h3>Log Prospector</h3>
        Reads every line of the log file.
        {this.example(`filebeat.prospectors:
  - type: log
    paths:
      - /var/log/apache/httpd-*.log`)}
      </div>
    );
  },

  redisProspector() {
    return (
      <div>
        <h3>Redis Prospector</h3>
        Reads slow log entries from redis (experimental).
        {this.example(`filebeat.prospectors:
  - type: redis
    hosts: ["localhost:6379"]
    username: "redis"
    password: "secret"
    scan_frequency: 10s`)}
      </div>
    );
  },

  example(data) {
    return (
      <pre className={`${ConfigurationHelperStyle.marginTab} ${ConfigurationHelperStyle.exampleFunction}`} >{data}</pre>
    );
  },

  render() {
    const data = {
      prospector: {
        log: this.logProspector(),
        redis: this.redisProspector(),
      },
    };

    return (
      data[this.props.section][this.props.paragraph]
    );
  },
});
export default FilebeatHelper;
