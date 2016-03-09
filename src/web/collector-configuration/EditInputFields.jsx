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

  _getId(prefixIdName) {
    return prefixIdName + this.props.type;
  },

  _injectProperty(name) {
    return (event) => this.props.injectProperties(name, event);
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
                     defaultValue={this.props.properties.path}
                     onChange={this._injectProperty('path')}
                     help="Location of the log file to use"
                     required />
            </div>);
        case 'nxlog:windows-event-log':
          return (null);
        default:
        // Do nothing
      }
    }
    return (null);
  },
});

export default EditInputFields;
