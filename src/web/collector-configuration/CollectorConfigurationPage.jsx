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
import DocsHelper from 'util/DocsHelper';

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import withParams from 'routing/withParams';
import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';
import style from 'styles/CollectorStyles.lazy.css';

import CollectorConfiguration from './CollectorConfiguration';
import CollectorsPageNavigation from '../collectors/CollectorsPageNavigation';

const CollectorConfigurationPage = createReactClass({
  displayName: 'CollectorConfigurationPage',

  propTypes: {
    params: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      configuration: undefined,
      tags: undefined,
    };
  },

  componentDidMount() {
    style.use();
    this._reloadConfiguration();
    this._loadTags();
  },

  componentWillUnmount() {
    style.unuse();
  },

  _reloadConfiguration() {
    CollectorConfigurationsActions.getConfiguration.triggerPromise(this.props.params.id).then(this._setConfiguration);
  },

  _setConfiguration(configuration) {
    this.setState({ configuration });
  },

  _loadTags() {
    CollectorConfigurationsActions.listTags.triggerPromise()
      .then((tags) => {
        this.setState({ tags });
      });
  },

  _isLoading() {
    return !(this.state.configuration && this.state.tags);
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const lifecycleMessage = (
      <span>The Graylog Collector plugin is discontinued and has been superseded by the new Sidecars.</span>
    );

    return (
      <DocumentTitle title={`Collector ${this.state.configuration.name} configuration`}>
        <CollectorsPageNavigation />
        <PageHeader title={<span>Collector <em>{this.state.configuration.name}</em> Configuration</span>}
                    lifecycle="legacy"
                    lifecycleMessage={lifecycleMessage}
                    documentationLink={{
                      title: 'Sidecar documentation',
                      path: DocsHelper.PAGES.COLLECTOR_SIDECAR,
                    }}>
          <span>
            Use this page to review and manage the configuration for this collector.
          </span>
        </PageHeader>
        <CollectorConfiguration configuration={this.state.configuration}
                                tags={this.state.tags}
                                onConfigurationChange={this._reloadConfiguration} />
      </DocumentTitle>
    );
  },
});

export default withParams(CollectorConfigurationPage);
