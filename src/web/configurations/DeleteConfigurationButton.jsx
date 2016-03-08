import React from 'react';
import { Button } from 'react-bootstrap';

const DeleteConfigurationButton = React.createClass({
    propTypes: {
        configuration: React.PropTypes.object.isRequired,
        onClick: React.PropTypes.func.isRequired,
    },

    handleClick() {
        if (window.confirm('Really delete configuration?')) {
            this.props.onClick(this.props.configuration, function () {});
        }
    },

    render() {
        return (
            <Button className="btn btn-danger btn-xs" onClick={this.handleClick}>
                Delete
            </Button>
        );
    },
});

export default DeleteConfigurationButton;
