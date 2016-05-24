import React from 'react';
import { Input } from 'react-bootstrap';

import FormUtils from 'util/FormsUtils';

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

  componentWillMount() {
    this._setDefaultValue(this.props.type, this.props.properties);
  },

  componentWillUpdate(nextProps) {
    this._setDefaultValue(nextProps.type, nextProps.properties);
  },

  _setDefaultValue(type, value) {
    switch (type) {
      case 'topbeat:elasticsearch':
        if (!value.hasOwnProperty('hosts')) {
          this.props.injectProperties('hosts', '["localhost:9200"]');
        };
        if (!value.hasOwnProperty('indexname')) {
          this.props.injectProperties('indexname', 'topbeat');
        };
        break;
      case 'topbeat:logstash':
        if (!value.hasOwnProperty('hosts')) {
          this.props.injectProperties('hosts', '["localhost:5044"]');
        };
        break;
      case 'filebeat:elasticsearch':
        if (!value.hasOwnProperty('hosts')) {
          this.props.injectProperties('hosts', '["localhost:9200"]');
        };
        if (!value.hasOwnProperty('indexname')) {
          this.props.injectProperties('indexname', 'filebeat');
        };
        break;
      case 'filebeat:logstash':
        if (!value.hasOwnProperty('hosts')) {
          this.props.injectProperties('hosts', '["localhost:5044"]');
        };
        break;
      case 'winlogbeat:elasticsearch':
        if (!value.hasOwnProperty('hosts')) {
          this.props.injectProperties('hosts', '["localhost:9200"]');
        };
        if (!value.hasOwnProperty('indexname')) {
          this.props.injectProperties('indexname', 'winlogbeat');
        };
        break;
      case 'winlogbeat:logstash':
        if (!value.hasOwnProperty('hosts')) {
          this.props.injectProperties('hosts', '["localhost:5044"]');
        };
        break;
    }
  },

  _getId(prefixIdName) {
    return prefixIdName + this.props.type;
  },

  _injectProperty(name) {
    return (event) => this.props.injectProperties(name, FormUtils.getValueFromInput(event.target));
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
                     value={this.props.properties.server}
                     onChange={this._injectProperty('server')}
                     help="Type the server IP for this output"
                     required />
              <Input type="number"
                     id={this._getId('gelf-udp-port')}
                     min={0}
                     label="Port"
                     value={this.props.properties.port}
                     onChange={this._injectProperty('port')}
                     help="Type a port number for this output"
                     required />
            </div>);
            break;
        case 'nxlog:gelf-tcp':
          return (
              <div>
                <Input type="text"
                       id={this._getId('gelf-tcp-server')}
                       label="Server IP"
                       value={this.props.properties.server}
                       onChange={this._injectProperty('server')}
                       help="Type the server IP for this output"
                       required />
                <Input type="number"
                       id={this._getId('gelf-tcp-port')}
                       min={0}
                       label="Port"
                       value={this.props.properties.port}
                       onChange={this._injectProperty('port')}
                       help="Type a port number for this output"
                       required />
              </div>);
          break;
        case 'nxlog:gelf-tcp-tls':
          return (
              <div>
                <Input type="text"
                       id={this._getId('gelf-tcp-tls-server')}
                       label="Server IP"
                       value={this.props.properties.server}
                       onChange={this._injectProperty('server')}
                       help="Type the server IP for this output"
                       required />
                <Input type="number"
                       id={this._getId('gelf-tcp-tls-port')}
                       min={0}
                       label="Port"
                       value={this.props.properties.port}
                       onChange={this._injectProperty('port')}
                       help="Type a port number for this output"
                       required />
                <Input type="text"
                       id={this._getId('gelf-tcp-tls-ca-file')}
                       label="CA File"
                       value={this.props.properties.ca_file}
                       onChange={this._injectProperty('ca_file')}
                       help="The path of the certificate of the CA"
                       required />
                <Input type="text"
                       id={this._getId('gelf-tcp-tls-cert-file')}
                       label="Cert File"
                       value={this.props.properties.cert_file}
                       onChange={this._injectProperty('cert_file')}
                       help="The path of the certificate file"
                       required />
                <Input type="text"
                       id={this._getId('gelf-tcp-tls-key-file')}
                       label="Key File"
                       value={this.props.properties.cert_key_file}
                       onChange={this._injectProperty('cert_key_file')}
                       help="The path of the key file"
                       required />
                <Input type="checkbox"
                       id={this._getId('gelf-tcp-tls-untrusted')}
                       label="Allow untrusted certificate"
                       checked={this.props.properties.allow_untrusted}
                       onChange={this._injectProperty('allow_untrusted')}
                       help="Specifies whether the connection should be allowed without certificate verification"/>
              </div>);
          break;
        case 'topbeat:elasticsearch':
          return (
              <div>
                <Input type="text"
                       id={this._getId('es-server')}
                       label="Hosts"
                       value={this.props.properties.hosts}
                       onChange={this._injectProperty('hosts')}
                       help="Array of hosts to connect to"
                       required/>
                <Input type="text"
                       id={this._getId('es-index')}
                       label="Index"
                       value={this.props.properties.indexname}
                       onChange={this._injectProperty('indexname')}
                       help="Index name"
                       required/>
              </div>);
          break;
        case 'topbeat:logstash':
          return (
              <div>
                <Input type="text"
                       id={this._getId('logstash-server')}
                       label="Hosts"
                       value={this.props.properties.hosts}
                       onChange={this._injectProperty('hosts')}
                       help="Array of hosts to connect to"
                       required />
                </div>);
          break;
        case 'filebeat:elasticsearch':
          return (
              <div>
                <Input type="text"
                       id={this._getId('es-server')}
                       label="Hosts"
                       value={this.props.properties.hosts}
                       onChange={this._injectProperty('hosts')}
                       help="Array of hosts to connect to"
                       required/>
                <Input type="text"
                       id={this._getId('es-index')}
                       label="Index"
                       value={this.props.properties.indexname}
                       onChange={this._injectProperty('indexname')}
                       help="Index name"
                       required/>
              </div>);
          break;
        case 'filebeat:logstash':
          return (
              <div>
                <Input type="text"
                       id={this._getId('logstash-server')}
                       label="Hosts"
                       value={this.props.properties.hosts}
                       onChange={this._injectProperty('hosts')}
                       help="Array of hosts to connect to"
                       required />
              </div>);
          break;
        case 'winlogbeat:elasticsearch':
          return (
              <div>
                <Input type="text"
                       id={this._getId('es-server')}
                       label="Hosts"
                       value={this.props.properties.hosts}
                       onChange={this._injectProperty('hosts')}
                       help="Array of hosts to connect to"
                       required/>
                <Input type="text"
                       id={this._getId('es-index')}
                       label="Index"
                       value={this.props.properties.indexname}
                       onChange={this._injectProperty('indexname')}
                       help="Index name"
                       required/>
              </div>);
          break;
        case 'winlogbeat:logstash':
          return (
              <div>
                <Input type="text"
                       id={this._getId('logstash-server')}
                       label="Hosts"
                       value={this.props.properties.hosts}
                       onChange={this._injectProperty('hosts')}
                       help="Array of hosts to connect to"
                       required />
              </div>);
          break;
        default:
          // Nothing to see here
      }
    }
    return (null);
  },
});

export default EditOutputFields;
