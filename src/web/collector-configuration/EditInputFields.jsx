import React from 'react';
import { Input } from 'react-bootstrap';

const EditInputFields = React.createClass({
  propTypes: {
    type: React.PropTypes.string,
    properties: React.PropTypes.object,
    injectProperties: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      type: '',
    };
  },

  componentWillMount() {
    this._setDefaultValue(this.props.type, this.props.properties);
  },

  componentWillUpdate(nextProps) {
    this._setDefaultValue(nextProps.type, nextProps.properties);
  },

  _setDefaultValue(type, value) {
    switch (type) {
      case 'topbeat:topbeat':
        if (!value.hasOwnProperty('period')) {
          this.props.injectProperties('period', '10');
        };
        if (!value.hasOwnProperty('procs')) {
          this.props.injectProperties('procs', '[.*]');
        };
        break;
      case 'filebeat:file':
        if (!value.hasOwnProperty('paths')) {
          this.props.injectProperties('paths', '["/var/log/*.log"]');
        };
        if (!value.hasOwnProperty('scan_frequency')) {
          this.props.injectProperties('scan_frequency', '10s');
        };
        if (!value.hasOwnProperty('ignore_older')) {
          this.props.injectProperties('ignore_older', '0');
        };
        if (!value.hasOwnProperty('document_type')) {
          this.props.injectProperties('document_type', 'log');
        };
        break;
    }
  },

  _getId(prefixIdName) {
    return prefixIdName + this.props.type;
  },

  _injectProperty(name) {
    return (event) => this.props.injectProperties(name, event.target.value);
  },

  render() {
    if (this.props.type) {
      switch (this.props.type) {
        case 'nxlog:file':
          return (
            <div>
              <Input type="text"
                     id={this._getId('file-path')}
                     label="Path to Logfile"
                     value={this.props.properties.path}
                     onChange={this._injectProperty('path')}
                     help="Location of the log file to use"
                     required />
            </div>);
        case 'nxlog:windows-event-log':
          return (null);
        case 'topbeat:topbeat':
          return (
            <div>
              <Input type="number"
                     id={this._getId('period')}
                     min={1}
                     label="Period"
                     value={this.props.properties.period}
                     onChange={this._injectProperty('period')}
                     help="In seconds, defines how often to read server statistics"
                     required />
              <Input type="text"
                     id={this._getId('procs')}
                     label="Processes"
                     value={this.props.properties.procs}
                     onChange={this._injectProperty('procs')}
                     help="Regular expression to match the processes that are monitored"
                     required />
            </div>);
        case 'filebeat:file':
          return (
              <div>
                <Input type="text"
                       id={this._getId('file-paths')}
                       label="Path to Logfile"
                       value={this.props.properties.paths}
                       onChange={this._injectProperty('paths')}
                       help="Location of the log files to use"
                       required />
                <Input type="text"
                       id={this._getId('scan-frequency')}
                       label="Scan frequency in seconds"
                       value={this.props.properties.scan_frequency}
                       onChange={this._injectProperty('scan_frequency')}
                       help="How often should files be checked for changes"
                       required />
                <Input type="text"
                       id={this._getId('ignore-older')}
                       label="Ignore files older then"
                       value={this.props.properties.ignore_older}
                       onChange={this._injectProperty('ignore_older')}
                       help="Ignore files which were modified more then the defined timespan in the past (e.g 2h)"
                       required />
                <Input type="text"
                       id={this._getId('document-type')}
                       label="Type of input file"
                       value={this.props.properties.document_type}
                       onChange={this._injectProperty('document_type')}
                       help="Type to be published in the 'type' field (e.g. 'log' or 'apache')"
                       required />
              </div>);
          break;
        default:
        // Do nothing
      }
    }
    return (null);
  },
});

export default EditInputFields;
