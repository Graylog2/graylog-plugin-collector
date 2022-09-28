/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { LinkContainer } from 'components/common/router';
import ButtonToolbar from 'components/bootstrap/ButtonToolbar';
import styled from 'styled-components';
import { Button } from 'components/bootstrap';
import Routes from 'routing/Routes';
import style from 'styles/CollectorStyles.lazy.css';

import EditConfigurationModal from './EditConfigurationModal';
import CopyConfigurationModal from './CopyConfigurationModal';

const StyledButtonToolbar = styled(ButtonToolbar)`
  display: flex;
`

const ConfigurationRow = createReactClass({
  displayName: 'ConfigurationRow',

  propTypes: {
    configuration: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    validateConfiguration: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  },

  componentDidMount() {
    style.use();
  },

  componentWillUnmount() {
    style.unuse();
  },

  _handleClick() {
    const { configuration } = this.props;
    if (window.confirm(`You are about to delete configuration "${configuration.name}". Are you sure?`)) {
      this.props.onDelete(configuration);
    }
  },

  render() {
    const { configuration } = this.props;
    const tagBadges = configuration.tags.map((tag) => {
      return <span className="badge configuration-tag" key={tag}>{tag}</span>;
    });

    return (
      <tr>
        <td className="name limited">
          <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_CONFIGURATIONS_ID')(configuration.id)}>
            <a>{configuration.name}</a>
          </LinkContainer>
        </td>
        <td>
          {tagBadges}
        </td>
        <td>
          <StyledButtonToolbar>
            <EditConfigurationModal configuration={this.props.configuration}
                                    updateConfiguration={this.props.onUpdate}
                                    validConfigurationName={this.props.validateConfiguration} />
            <CopyConfigurationModal id={this.props.configuration.id}
                                    validConfigurationName={this.props.validateConfiguration}
                                    copyConfiguration={this.props.onCopy} />
            <Button bsStyle="danger" bsSize="xsmall" onClick={this._handleClick}>
              Delete
            </Button>
          </StyledButtonToolbar>
        </td>
      </tr>
    );
  },
});

export default ConfigurationRow;
