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
        Reads every line of the log file.

        <pre className={`${ConfigurationHelperStyle.marginTab} ${ConfigurationHelperStyle.exampleFunction}`} style={{ whiteSpace: 'pre-wrap' }}>
        filebeat.prospectors:
        - type: log
        paths:
        - /var/log/apache/httpd-*.log`,\
        </pre>
      </div>
    );
  },

  redisProspector() {
    return (
      <div>
        Reads slow log entries from redis (experimental).
        <pre className={`${ConfigurationHelperStyle.marginTab} ${ConfigurationHelperStyle.exampleFunction}`} style={{ whiteSpace: 'pre-wrap' }}>
          - type: redis
            hosts: ["localhost:6379"]
            username: "redis"
            password: "secret"
            scan_frequency: 10s
        </pre>
      </div>
    );
  },


  render() {
    const data = {
      prospector: {
        log: this.logProspector,
        redis: this.redisProspector(),
      },
    };

    return (
      data[this.props.section][this.props.paragraph]
    );
  },
});
export default FilebeatHelper;
