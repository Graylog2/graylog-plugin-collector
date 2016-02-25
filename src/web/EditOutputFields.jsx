import React from 'react';
import { Input } from 'react-bootstrap';

const EditOutputFields = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
        properties: React.PropTypes.object,
        injectProperties: React.PropTypes.func.isRequired,
    },

    _getId(prefixIdName) {
        return this.props.type !== undefined ? prefixIdName + this.props.type : prefixIdName;
    },

    render() {
        if (this.props) {
            switch (this.props.type) {
                case "nxlog:gelf-udp":
                    return (
                        <div>
                            <Input type="text"
                                   id={this._getId('gelf-udp-server')}
                                   label="Server IP"
                                   defaultValue={this.props.properties.server}
                                   onChange={(prop) => this.props.injectProperties("server", prop)}
                                   help={null}
                                   required/>
                            <Input type="text"
                                   id={this._getId('gelf-udp-port')}
                                   label="Port"
                                   defaultValue={this.props.properties.port}
                                   onChange={(prop) => this.props.injectProperties("port", prop)}
                                   help={null}
                                   required/>
                        </div>);
            }
        }
        return (null)
    }
});

export default EditOutputFields;