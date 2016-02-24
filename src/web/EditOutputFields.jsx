import React from 'react';
import { Input } from 'react-bootstrap';

const EditOutputFields = React.createClass({
    propTypes: {
        type: React.PropTypes.object,
        properties: React.PropTypes.object,
        injectProperties: React.PropTypes.func.isRequired,
    },

    _getId(prefixIdName) {
        return this.props.type.value !== undefined ? prefixIdName + this.props.type.value : prefixIdName;
    },

    render() {
        if (this.props.type) {
            switch (this.props.type.value) {
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