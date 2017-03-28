import React from 'react';
import { Input } from 'components/bootstrap';

import FormUtils from 'util/FormsUtils';
import { KeyValueTable, Select } from 'components/common';

import CollapsibleVerbatim from './CollapsibleVerbatim';

const EditInputFields = React.createClass({
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
      case 'nxlog:file':
        if (!value.hasOwnProperty('poll_interval')) {
          this.props.injectProperties('poll_interval', '1');
        };
        if (!value.hasOwnProperty('save_position')) {
          this.props.injectProperties('save_position', true);
        };
        if (!value.hasOwnProperty('read_last')) {
          this.props.injectProperties('read_last', true);
        };
        if (!value.hasOwnProperty('recursive')) {
          this.props.injectProperties('recursive', true);
        };
        if (!value.hasOwnProperty('rename_check')) {
          this.props.injectProperties('rename_check', false);
        };
        if (!value.hasOwnProperty('multiline')) {
          this.props.injectProperties('multiline', false);
        };
        if (!value.hasOwnProperty('multiline_start')) {
          this.props.injectProperties('multiline_start', "/^-./");
        };
        break;
      case 'nxlog:windows-event-log':
        if (!value.hasOwnProperty('poll_interval')) {
          this.props.injectProperties('poll_interval', '1');
        };
        if (!value.hasOwnProperty('save_position')) {
          this.props.injectProperties('save_position', true);
        };
        if (!value.hasOwnProperty('read_last')) {
          this.props.injectProperties('read_last', true);
        };
        break;
      case 'nxlog:udp-syslog':
        if (!value.hasOwnProperty('host')) {
          this.props.injectProperties('host', '127.0.0.1');
        };
        if (!value.hasOwnProperty('port')) {
          this.props.injectProperties('port', 514);
        };
        break;
      case 'nxlog:tcp-syslog':
        if (!value.hasOwnProperty('host')) {
          this.props.injectProperties('host', '127.0.0.1');
        };
        if (!value.hasOwnProperty('port')) {
          this.props.injectProperties('port', 514);
        };
        break;
      case 'filebeat:file':
        if (!value.hasOwnProperty('paths')) {
          this.props.injectProperties('paths', '[\'/var/log/*.log\']');
        };
        if (!value.hasOwnProperty('scan_frequency')) {
          this.props.injectProperties('scan_frequency', '10s');
        };
        if (!value.hasOwnProperty('encoding')) {
          this.props.injectProperties('encoding', 'plain');
        };
        if (!value.hasOwnProperty('ignore_older')) {
          this.props.injectProperties('ignore_older', '0');
        };
        if (!value.hasOwnProperty('document_type')) {
          this.props.injectProperties('document_type', 'log');
        };
        if (!value.hasOwnProperty('exclude_lines')) {
          this.props.injectProperties('exclude_lines', '[]');
        };
        if (!value.hasOwnProperty('include_lines')) {
          this.props.injectProperties('include_lines', '[]');
        };
        if (!value.hasOwnProperty('tail_files')) {
          this.props.injectProperties('tail_files', true);
        };
        break;
      case 'winlogbeat:windows-event-log':
        if (!value.hasOwnProperty('event')) {
          this.props.injectProperties('event', '[{\'name\':\'Application\'},{\'name\':\'System\'},{\'name\':\'Security\'}]');
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

  _changeDuration(name) {
    return (event) => {
      if (!this._validDuration(event.target.value)) {
        this._changeErrorState(true, 'Invalid Duration, it should look like: 10s', event.target.id);
      } else {
        this._changeErrorState(false, '', event.target.id);
      }
      this.props.injectProperties(name, FormUtils.getValueFromInput(event.target))
    }
  },

  _changeNumber(name) {
    return (event) => {
      if (!this._validNumber(event.target.value)) {
        this._changeErrorState(true, 'Invalid number', event.target.id);
      } else {
        this._changeErrorState(false, '', event.target.id);
      }
      this.props.injectProperties(name, FormUtils.getValueFromInput(event.target))
    }
  },

  _changePattern(name) {
    return (event) => {
      if (!this._validPattern(event.target.value)) {
        this._changeErrorState(true, 'Invalid pattern, it should look like: /^foo/', event.target.id);
      } else {
        this._changeErrorState(false, '', event.target.id);
      }
      this.props.injectProperties(name, FormUtils.getValueFromInput(event.target))
    }
  },

  _changeXml(name) {
    return (event) => {
      if (!this._validXml(event.target.value)) {
        this._changeErrorState(true, 'Invalid XML', event.target.id);
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

  _validDuration(value) {
    const durationRex = /(^\d+[smh])|0/;
    return durationRex.test(value);
  },

  _validNumber(value) {
    return !isNaN(parseInt(value));
  },

  _validPattern(value) {
    const patternRex = /(^\/.*\/$)|^$/;
    return patternRex.test(value);
  },

  _validXml(value) {
    var parser = new DOMParser();
    var xml = parser.parseFromString(value, "application/xml");
    const parseError = xml.getElementsByTagName("parsererror").length != 0;
    return value.length == 0 || !parseError;
  },

  _fieldError(name) {
    return this.state.error && this.props.errorFields.indexOf(this._getId(name)) !== -1;
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
                     help="Location of the log file to use. Wildcards are supported in filenames, like '*' or '?'"
                     required />
              <Input type="number"
                     id={this._getId('poll-interval')}
                     min={1}
                     label="Poll Interval"
                     value={this.props.properties.poll_interval}
                     onChange={this._injectProperty('poll_interval')}
                     help="In seconds how frequently the collector will check for new files and new log entries"/>
              <Input type="checkbox"
                     id={this._getId('save-position')}
                     label="Save read position"
                     checked={this.props.properties.save_position}
                     onChange={this._injectProperty('save_position')}
                     help="Restore read position in case of a collector restart"/>
              <Input type="checkbox"
                     id={this._getId('read-last')}
                     label="Read since start"
                     checked={this.props.properties.read_last}
                     onChange={this._injectProperty('read_last')}
                     help="Instructs the collector to only read logs which arrived after nxlog was started"/>
              <Input type="checkbox"
                     id={this._getId('recursive')}
                     label="Recursive file lookup"
                     checked={this.props.properties.recursive}
                     onChange={this._injectProperty('recursive')}
                     help="Specifies whether input files should be searched recursively under subdirectories"/>
              <Input type="checkbox"
                     id={this._getId('rename_check')}
                     label="Rename check"
                     checked={this.props.properties.rename_check}
                     onChange={this._injectProperty('rename_check')}
                     help="Whether input files should be monitored for possible file rotation via renaming"/>
              <Input type="checkbox"
                     id={this._getId('multiline')}
                     label="Enable Multiline"
                     checked={this.props.properties.multiline}
                     onChange={this._injectProperty('multiline')}
                     help="Enable multiline extension"/>
              <Input type="text"
                     id={this._getId('multiline-start')}
                     label="Start pattern of multiline"
                     value={this.props.properties.multiline_start}
                     onChange={this._changePattern('multiline_start')}
                     bsStyle={this._fieldError('multiline-start') ? 'error' : null}
                     help={this._fieldError('multiline-start') ? this.state.errorMessage: "RegEx starting pattern of a multiline"}/>
              <Input type="text"
                     id={this._getId('multiline-stop')}
                     label="Stop pattern of multiline"
                     value={this.props.properties.multiline_stop}
                     onChange={this._changePattern('multiline_stop')}
                     bsStyle={this._fieldError('multiline-stop') ? 'error' : null}
                     help={this._fieldError('multiline-stop') ? this.state.errorMessage: "RegEx stop pattern of a multiline"}/>
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
        case 'nxlog:windows-event-log':
          return (
              <div>
                <Input type="text"
                       id={this._getId('channel')}
                       label="Channel"
                       value={this.props.properties.channel}
                       onChange={this._injectProperty('channel')}
                       help={<span>The name of the Channel to query. If not specified, the module will read from all sources. Read more on <a href="https://msdn.microsoft.com/en-us/library/aa385225.aspx" target="_blank">MSDN</a></span>}/>
                <Input type="textarea"
                       id={this._getId('query')}
                       label="Query"
                       value={this.props.properties.query}
                       onChange={this._changeXml('query')}
                       bsStyle={this._fieldError('query') ? 'error' : null}
                       help={this._fieldError('query') ? this.state.errorMessage: <span>The query if one wishes to pull only specific eventlog sources. Read more on <a href="https://msdn.microsoft.com/en-us/library/aa385231.aspx" target="_blank">MSDN</a></span>}/>
                <Input type="checkbox"
                       id={this._getId('save-position')}
                       label="Save read position"
                       checked={this.props.properties.save_position}
                       onChange={this._injectProperty('save_position')}
                       help="Restore read position in case of a collector restart"/>
                <Input type="checkbox"
                       id={this._getId('read-last')}
                       label="Read since start"
                       checked={this.props.properties.read_last}
                       onChange={this._injectProperty('read_last')}
                       help="Instructs the collector to only read logs which arrived after nxlog was started"/>
                <Input type="number"
                       id={this._getId('poll-interval')}
                       min={1}
                       label="Poll Interval"
                       value={this.props.properties.poll_interval}
                       onChange={this._injectProperty('poll_interval')}
                       help="In seconds how frequently the collector will check for new files and new log entries"/>
                <Input label="Additional Fields"
                       help="Allowed characters: a-z0-9-_.">
                  <KeyValueTable pairs={this.state.fields}
                                 editable={true}
                                 onChange={this._changeFields} />
                </Input>
                <CollapsibleVerbatim type={this.props.type}
                                     value={this.props.properties.verbatim}
                                     onChange={this._injectProperty}/>
              </div>);
        case 'nxlog:udp-syslog':
          return (
              <div>
                <Input type="text"
                       id={this._getId('host')}
                       label="Host"
                       value={this.props.properties.host}
                       onChange={this._injectProperty('host')}
                       help="Listen address of the UDP port. 0.0.0.0 allows remote machines to use the collector as a relay"
                       required/>
                <Input type="number"
                       id={this._getId('port')}
                       label="Port"
                       value={this.props.properties.port}
                       onChange={this._injectProperty('port')}
                       help="Port number of the UDP input"
                       required/>
                <Input label="Additional Fields"
                       help="Allowed characters: a-z0-9-_.">
                  <KeyValueTable pairs={this.state.fields}
                                 editable={true}
                                 onChange={this._changeFields} />
                </Input>
                <CollapsibleVerbatim type={this.props.type}
                                     value={this.props.properties.verbatim}
                                     onChange={this._injectProperty}/>
              </div>);
        case 'nxlog:tcp-syslog':
          return (
              <div>
                <Input type="text"
                       id={this._getId('host')}
                       label="Host"
                       value={this.props.properties.host}
                       onChange={this._injectProperty('host')}
                       help="Listen address of the TCP port. 0.0.0.0 allows remote machines to use the collector as a relay"
                       required/>
                <Input type="number"
                       id={this._getId('port')}
                       label="Port"
                       value={this.props.properties.port}
                       onChange={this._injectProperty('port')}
                       help="Port number of the TCP input"
                       required/>
                <Input label="Additional Fields"
                       help="Allowed characters: a-z0-9-_.">
                  <KeyValueTable pairs={this.state.fields}
                                 editable={true}
                                 onChange={this._changeFields} />
                </Input>
                <CollapsibleVerbatim type={this.props.type}
                                     value={this.props.properties.verbatim}
                                     onChange={this._injectProperty}/>
              </div>);
        case 'filebeat:file':
          return (
              <div>
                <Input type="text"
                       id={this._getId('file-paths')}
                       label="Path to Logfile"
                       value={this.props.properties.paths}
                       onChange={this._changeList('paths')}
                       bsStyle={this._fieldError('file-paths') ? 'error' : null}
                       help={this._fieldError('file-paths') ? this.state.errorMessage: "Location of the log files to use"}
                       required />
                <Input type="text"
                       id={this._getId('encoding')}
                       label="Encoding"
                       value={this.props.properties.encoding}
                       onChange={this._injectProperty('encoding')}
                       help="Type to be published in the 'encoding' field (e.g. 'utf-8' or 'gbk')"
                       required />
                <Input type="text"
                       id={this._getId('document-type')}
                       label="Type of input file"
                       value={this.props.properties.document_type}
                       onChange={this._injectProperty('document_type')}
                       help="Type to be published in the 'type' field (e.g. 'log' or 'apache')"
                       required />
                <Input type="text"
                       id={this._getId('ignore-older')}
                       label="Ignore files older than"
                       value={this.props.properties.ignore_older}
                       onChange={this._changeDuration('ignore_older')}
                       bsStyle={this._fieldError('ignore-older') ? 'error' : null}
                       help={this._fieldError('ignore-older') ? this.state.errorMessage: "Ignore files which were modified more than the defined timespan in the past (e.g. 2h)"}
                       required />
                <Input type="text"
                       id={this._getId('scan-frequency')}
                       label="Scan frequency in seconds"
                       value={this.props.properties.scan_frequency}
                       onChange={this._changeDuration('scan_frequency')}
                       bsStyle={this._fieldError('scan-frequency') ? 'error' : null}
                       help={this._fieldError('scan-frequency') ? this.state.errorMessage: "How often should files be checked for changes"}
                       required />
                <Input type="text"
                       id={this._getId('exclude-lines')}
                       label="Lines that you want Filebeat to exclude"
                       value={this.props.properties.exclude_lines}
                       onChange={this._changeList('exclude_lines')}
                       bsStyle={this._fieldError('exclude-lines') ? 'error' : null}
                       help={this._fieldError('exclude-lines') ? this.state.errorMessage: "A list of regular expressions to match the lines that you want Filebeat to exclude"} />
                <Input type="text"
                       id={this._getId('include-lines')}
                       label="Lines that you want Filebeat to include"
                       value={this.props.properties.include_lines}
                       onChange={this._changeList('include_lines')}
                       bsStyle={this._fieldError('include-lines') ? 'error' : null}
                       help={this._fieldError('include-lines') ? this.state.errorMessage: "A list of regular expressions to match the lines that you want Filebeat to include"} />
                <Input type="checkbox"
                       id={this._getId('tail-files')}
                       label="Tail files"
                       checked={this.props.properties.tail_files}
                       onChange={this._injectProperty('tail_files')}
                       help="Start reading new files at the end instead of the beginning"/>
                <Input type="checkbox"
                       id={this._getId('multiline')}
                       label="Enable Multiline"
                       checked={this.props.properties.multiline}
                       onChange={this._injectProperty('multiline')}
                       help="Enable multiline support"/>
                <Input type="text"
                       id={this._getId('multiline-pattern')}
                       label="Start pattern of a multiline message"
                       value={this.props.properties.multiline_pattern}
                       onChange={this._injectProperty('multiline_pattern')}
                       help="Specifies the regular expression pattern to match"/>
                <Input type="checkbox"
                       id={this._getId('multiline-negate')}
                       label="Multiline pattern is negated"
                       checked={this.props.properties.multiline_negate}
                       onChange={this._injectProperty('multiline_negate')}
                       help="Defines whether the pattern is negated"/>
                <Input type="select"
                       id={this._getId('multiline-match')}
                       label="How are matching lines combined into one event"
                       onChange={this._injectProperty('multiline_match')}
                       value={this.props.properties.multiline_match}
                       help="Specifies how Filebeat combines matching lines into an event.">
                  <option key="before" value="before">before</option>
                  <option key="after" value="after">after</option>
                </Input>
                <Input label="Additional Fields"
                       help="Allowed characters: a-z0-9-_.">
                  <KeyValueTable pairs={this.state.fields}
                                 editable={true}
                                 onChange={this._changeFields}/>
                </Input>
              </div>);
        case 'winlogbeat:windows-event-log':
          return (
              <div>
                <Input type="text"
                       id={this._getId('event')}
                       label="Event name"
                       value={this.props.properties.event}
                       onChange={this._changeList('event')}
                       bsStyle={this._fieldError('event') ? 'error' : null}
                       help={this._fieldError('event') ? this.state.errorMessage: "List of Windows events"}
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
