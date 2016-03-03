import React from 'react';
import jsRoutes from 'routing/jsRoutes';
import { LinkContainer } from 'react-router-bootstrap';
import { Button } from 'react-bootstrap';

import {Timestamp} from 'components/common';
import DeleteConfigurationButton from './DeleteConfigurationButton';

const ConfigurationRow = React.createClass({
    propTypes: {
        configuration: React.PropTypes.object.isRequired,
        onDelete: React.PropTypes.func.isRequired,
    },

    getInitialState() {
        return {
            null,
        };
    },

    render() {
        const configuration = this.props.configuration;
        const tagBadges = configuration.tags.map((tag) => <span key={tag} className={`label label-default`} style={{marginRight: 5}}>{tag}</span>);

        return (
            <tr>
                <td className="limited">
                    <LinkContainer to={`/system/collectors/configurations/${configuration._id}`}>
                        <a>{configuration.name}</a>
                    </LinkContainer>
                </td>
                <td className="limited">
                    {tagBadges}
                </td>
                <td className="limited">
                    <DeleteConfigurationButton configuration={configuration} onClick={this.props.onDelete}/>
                </td>
            </tr>
        );
    },
});

export default ConfigurationRow;
