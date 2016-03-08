import React from 'react';
import { Input } from 'react-bootstrap';

const EditOutputFields = React.createClass({
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
    if (this.props) {
      switch (this.props.type) {
        case 'nxlog:gelf-udp':
          return (
            <div>
              <Input type="text"
                     id={this._getId('gelf-udp-server')}
                     label="Server IP"
                     defaultValue={this.props.properties.server}
                     onChange={this._injectProperty('server')}
                     help={null}
                     required />
              <Input type="text"
                     id={this._getId('gelf-udp-port')}
                     label="Port"
                     defaultValue={this.props.properties.port}
                     onChange={this._injectProperty('port')}
                     help={null}
                     required />
            </div>);
        default:
          // Nothing to see here
      }
    }
    return (null);
  },
});

export default EditOutputFields;
