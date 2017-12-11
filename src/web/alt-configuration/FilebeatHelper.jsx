import PropTypes from 'prop-types';
import lodash from 'lodash';
import React from 'react';

import ConfigurationHelperStyle from './ConfigurationHelper.css';


const FilebeatHelper = React.createClass({
  propTypes: {
    section: PropTypes.string,
    paragraph: PropTypes.string,
  },

  statics: {
    toc: {
      prospectors: ['log', 'redis'],
      outputs: ['logstash'],
      filters: ['processors', 'json', 'drop events', 'add fields']
    },
  },

  prospectorsLog() {
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

  prospectorsRedis() {
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

  lookupName() {
    return lodash.camelCase(`${this.props.section} ${this.props.paragraph}`);
  },

  render() {
    if (this.props.section && this.props.paragraph) {
      return (
        this[this.lookupName()]()
      );
    } else {
      return (
        <div>Choose a configuration topic from the drop down to get a quick help.</div>
      );
    }
  },
});
export default FilebeatHelper;
