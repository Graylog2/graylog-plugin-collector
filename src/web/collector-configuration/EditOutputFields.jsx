import React from 'react';
import { Input } from 'components/bootstrap';

import FormUtils from 'util/FormsUtils';
import { KeyValueTable } from 'components/common';

import CollapsibleVerbatim from './CollapsibleVerbatim';

const EditOutputFields = React.createClass({
  propTypes: {
    type: React.PropTypes.string,
    properties: React.PropTypes.object,
    errorState: React.PropTypes.func,
    errorFields: React.PropTypes.array,
    injectProperties: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      type: '',
    };
  },

  getInitialState() {
    return {
      error: false,
      errorMessage: '',
    };
  },

  componentWillMount() {
    this._setDefaultValue(this.props.type, this.props.properties);
    if (this.props.properties.fields) {
      this.setState({fields: this.props.properties.fields});
    } else {
      this.setState({fields: {}});
    }
  },

  componentWillUpdate(nextProps) {
    this._setDefaultValue(nextProps.type, nextProps.properties);
  },

  _setDefaultValue(type, value) {
    switch (type) {
      case 'filebeat:logstash':
        if (!value.hasOwnProperty('hosts')) {
          this.props.injectProperties('hosts', '[\'localhost:5044\']');
        };
        break;
      case 'winlogbeat:logstash':
        if (!value.hasOwnProperty('hosts')) {
          this.props.injectProperties('hosts', '[\'localhost:5044\']');
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

  _changeErrorState(error, message, id) {
    this.setState({error: error, errorMessage: message});
    this.props.errorState(error, message, id);
  },

  _changeFields(fields) {
    for (var key in fields) {
      if (key != this._validField(key)) {
        return
      }
      fields[key] = this._validField(fields[key]);
    };
    this.setState({ fields: fields });
    this.props.injectProperties('fields', fields);
  },

  _changeList(name) {
    return (event) => {
      if (!this._validList(event.target.value)) {
        this._changeErrorState(true, 'Invalid JSON Array. Use the format: [\'first\', \'second\']', event.target.id);
      } else {
        this._changeErrorState(false, '', event.target.id);
      }
      this.props.injectProperties(name, FormUtils.getValueFromInput(event.target))
    }
  },

  _validField(value) {
    return value.replace(/[^a-zA-Z0-9-._]/ig, '');
  },

  _validList(value) {
    return value.indexOf('\"') === -1 && value.startsWith('[') && value.endsWith(']');
  },

  _fieldError(name) {
    return this.state.error && this.props.errorFields.indexOf(this._getId(name)) !== -1;
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
                       help="The graylog-server host to send the logs to."
                       required />
                <Input type="number"
                       id={this._getId('gelf-udp-port')}
                       min={0}
                       label="Port"
                       value={this.props.properties.port}
                       onChange={this._injectProperty('port')}
                       help="The port number of the graylog-server GELF input."
                       required />
                <Input type="checkbox"
                       id={this._getId('gelf-udp-buffered')}
                       label="Buffered"
                       checked={this.props.properties.buffered}
                       onChange={this._injectProperty('buffered')}
                       help="Enable 16MB message buffer"/>
                <Input type="checkbox"
                       id={this._getId('gelf-udp-hostname')}
                       label="Don't override hostname"
                       checked={this.props.properties.override_hostname}
                       onChange={this._injectProperty('override_hostname')}
                       help="If applied on a forwarder host, this prevents hostname overrides"/>
                <Input label="Additional Fields"
                       help="Allowed characters: a-z0-9-_.">
                  <KeyValueTable pairs={this.state.fields}
                                 editable={true}
                                 onChange={this._changeFields}/>
                </Input>
                <CollapsibleVerbatim type={this.props.type}
                                     value={this.props.properties.verbatim}
                                     onChange={this._injectProperty}/>
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
                       help="The graylog-server host to send the logs to."
                       required />
                <Input type="number"
                       id={this._getId('gelf-tcp-port')}
                       min={0}
                       label="Port"
                       value={this.props.properties.port}
                       onChange={this._injectProperty('port')}
                       help="The port number of the graylog-server GELF input."
                       required />
                <Input type="checkbox"
                       id={this._getId('gelf-tcp-buffered')}
                       label="Buffered"
                       checked={this.props.properties.buffered}
                       onChange={this._injectProperty('buffered')}
                       help="Enable 16MB message buffer"/>
                <Input type="checkbox"
                       id={this._getId('gelf-tcp-hostname')}
                       label="Don't override hostname"
                       checked={this.props.properties.override_hostname}
                       onChange={this._injectProperty('override_hostname')}
                       help="If applied on a forwarder host, this prevents hostname overrides"/>
                <Input label="Additional Fields"
                       help="Allowed characters: a-z0-9-_.">
                  <KeyValueTable pairs={this.state.fields}
                                 editable={true}
                                 onChange={this._changeFields}/>
                </Input>
                <CollapsibleVerbatim type={this.props.type}
                                     value={this.props.properties.verbatim}
                                     onChange={this._injectProperty}/>
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
                       help="The graylog-server host to send the logs to."
                       required />
                <Input type="number"
                       id={this._getId('gelf-tcp-tls-port')}
                       min={0}
                       label="Port"
                       value={this.props.properties.port}
                       onChange={this._injectProperty('port')}
                       help="The port number of the graylog-server GELF input."
                       required />
                <Input type="text"
                       id={this._getId('gelf-tcp-tls-ca-file')}
                       label="CA File"
                       value={this.props.properties.ca_file}
                       onChange={this._injectProperty('ca_file')}
                       help="The path of the certificate of the CA" />
                <Input type="text"
                       id={this._getId('gelf-tcp-tls-cert-file')}
                       label="Cert File"
                       value={this.props.properties.cert_file}
                       onChange={this._injectProperty('cert_file')}
                       help="The path of the certificate file" />
                <Input type="text"
                       id={this._getId('gelf-tcp-tls-key-file')}
                       label="Key File"
                       value={this.props.properties.cert_key_file}
                       onChange={this._injectProperty('cert_key_file')}
                       help="The path of the key file" />
                <Input type="checkbox"
                       id={this._getId('gelf-tcp-tls-untrusted')}
                       label="Allow untrusted certificate"
                       checked={this.props.properties.allow_untrusted}
                       onChange={this._injectProperty('allow_untrusted')}
                       help="Specifies whether the connection should be allowed without certificate verification"/>
                <Input type="checkbox"
                       id={this._getId('gelf-tcp-tls-buffered')}
                       label="Buffered"
                       checked={this.props.properties.buffered}
                       onChange={this._injectProperty('buffered')}
                       help="Enable 16MB message buffer"/>
                <Input type="checkbox"
                       id={this._getId('gelf-tcp-tls-hostname')}
                       label="Don't override hostname"
                       checked={this.props.properties.override_hostname}
                       onChange={this._injectProperty('override_hostname')}
                       help="If applied on a forwarder host, this prevents hostname overrides"/>
                <Input label="Additional Fields"
                       help="Allowed characters: a-z0-9-_.">
                  <KeyValueTable pairs={this.state.fields}
                                 editable={true}
                                 onChange={this._changeFields}/>
                </Input>
                <CollapsibleVerbatim type={this.props.type}
                                     value={this.props.properties.verbatim}
                                     onChange={this._injectProperty}/>
              </div>);
          break;
        case 'filebeat:logstash':
          return (
              <div>
                <Input type="text"
                       id={this._getId('logstash-server')}
                       label="Hosts"
                       value={this.props.properties.hosts}
                       onChange={this._changeList('hosts')}
                       bsStyle={this._fieldError('logstash-server') ? 'error' : null}
                       help={this._fieldError('logstash-server') ? this.state.errorMessage: "List of graylog-server hosts to send the logs to."}
                       required />
                <Input type="checkbox"
                       id={this._getId('logstash-loadbalance')}
                       label="Load balancing"
                       checked={this.props.properties.loadbalance}
                       onChange={this._injectProperty('loadbalance')}
                       help="If enabled and multiple servers are configured, events will balanced onto all hosts"/>
                <Input type="checkbox"
                       id={this._getId('logstash-tls')}
                       label="Enable TLS support"
                       checked={this.props.properties.tls}
                       onChange={this._injectProperty('tls')}
                       help="Use TLS authentication to secure connections between Beat and Graylog"/>
                <Input type="checkbox"
                       id={this._getId('logstash-tls-insecure')}
                       label="Insecure TLS connection"
                       checked={this.props.properties.tls_insecure}
                       onChange={this._injectProperty('tls_insecure')}
                       help="Controls whether the client verifies server certificates and host names"/>
                <Input type="text"
                       id={this._getId('logstash-tls-ca-file')}
                       label="CA File"
                       value={this.props.properties.ca_file}
                       onChange={this._injectProperty('ca_file')}
                       help="The path of the certificate of the CA" />
                <Input type="text"
                       id={this._getId('logstash-tls-cert-file')}
                       label="Cert File"
                       value={this.props.properties.cert_file}
                       onChange={this._injectProperty('cert_file')}
                       help="The path of the certificate file" />
                <Input type="text"
                       id={this._getId('logstash-tls-key-file')}
                       label="Key File"
                       value={this.props.properties.cert_key_file}
                       onChange={this._injectProperty('cert_key_file')}
                       help="The path of the key file" />
              </div>);
          break;
        case 'winlogbeat:logstash':
          return (
              <div>
                <Input type="text"
                       id={this._getId('logstash-server')}
                       label="Hosts"
                       value={this.props.properties.hosts}
                       onChange={this._changeList('hosts')}
                       bsStyle={this._fieldError('logstash-server') ? 'error' : null}
                       help={this._fieldError('logstash-server') ? this.state.errorMessage: "List of graylog-server hosts to send the logs to."}
                       required />
                <Input type="checkbox"
                       id={this._getId('logstash-loadbalance')}
                       label="Load balancing"
                       checked={this.props.properties.loadbalance}
                       onChange={this._injectProperty('loadbalance')}
                       help="If enabled and multiple servers are configured, events will balanced onto all hosts"/>
                <Input type="checkbox"
                       id={this._getId('logstash-tls')}
                       label="Enable TLS support"
                       checked={this.props.properties.tls}
                       onChange={this._injectProperty('tls')}
                       help="Use TLS authentication to secure connections between Beat and Graylog"/>
                <Input type="checkbox"
                       id={this._getId('logstash-tls-insecure')}
                       label="Insecure TLS connection"
                       checked={this.props.properties.tls_insecure}
                       onChange={this._injectProperty('tls_insecure')}
                       help="Controls whether the client verifies server certificates and host names"/>
                <Input type="text"
                       id={this._getId('logstash-tls-ca-file')}
                       label="CA File"
                       value={this.props.properties.ca_file}
                       onChange={this._injectProperty('ca_file')}
                       help="The path of the certificate of the CA" />
                <Input type="text"
                       id={this._getId('logstash-tls-cert-file')}
                       label="Cert File"
                       value={this.props.properties.cert_file}
                       onChange={this._injectProperty('cert_file')}
                       help="The path of the certificate file" />
                <Input type="text"
                       id={this._getId('logstash-tls-key-file')}
                       label="Key File"
                       value={this.props.properties.cert_key_file}
                       onChange={this._injectProperty('cert_key_file')}
                       help="The path of the key file" />
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
