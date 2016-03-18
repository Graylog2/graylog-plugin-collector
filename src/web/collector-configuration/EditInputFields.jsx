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
          break;
        default:
        // Do nothing
      }
    }
    return (null);
  },
});

export default EditInputFields;
