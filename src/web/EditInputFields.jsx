import React from 'react';
import { Input } from 'react-bootstrap';

const EditInputFields = React.createClass({
    propTypes: {
        type: React.PropTypes.string.isRequired,
        properties: React.PropTypes.object,
        injectProperties: React.PropTypes.func.isRequired,
    },

    _getId(prefixIdName) {
        return this.props.type !== undefined ? prefixIdName + this.props.type : prefixIdName;
    },

    render() {
        if (this.props.type) {
            switch (this.props.type) {
                case "nxlog:file":
                    return (
                        <div>
                            <Input type="text"
                                   id={this._getId('file-path')}
                                   label="Path to Logfile"
                                   defaultValue={this.props.properties.path}
                                   onChange={(prop) => this.props.injectProperties("path", prop)}
                                   help={null}
                                   required/>
                        </div>);
                case "nxlog:windows-event-log":
                    return(null);
            }
        }
        return (null)
    }
});

export default EditInputFields;