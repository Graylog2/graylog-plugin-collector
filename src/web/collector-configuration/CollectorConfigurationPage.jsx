import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { LinkContainer } from 'react-router-bootstrap';

import { Button } from 'components/graylog';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';
import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';

import CollectorConfiguration from './CollectorConfiguration';

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
    this.style.use();
    this._reloadConfiguration();
    this._loadTags();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/CollectorStyles.css'),

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
        <div>
          <PageHeader title={<span>Collector <em>{this.state.configuration.name}</em> Configuration</span>}
                      lifecycle="legacy"
                      lifecycleMessage={lifecycleMessage}>
            <span>
              Use this page to review and manage the configuration for this collector.
            </span>

            <span>
              Read more about collector configurations in the{' '}
              <DocumentationLink page={DocsHelper.PAGES.COLLECTOR_SIDECAR} text="Graylog documentation" />.
            </span>

            <span>
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS')}>
                <Button bsStyle="info">Overview</Button>
              </LinkContainer>
              &nbsp;
              <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_CONFIGURATIONS')}>
                <Button bsStyle="info" className="active">Manage Configurations</Button>
              </LinkContainer>
            </span>
          </PageHeader>
          <CollectorConfiguration configuration={this.state.configuration}
                                  tags={this.state.tags}
                                  onConfigurationChange={this._reloadConfiguration} />
        </div>
      </DocumentTitle>
    );
  },
});

export default CollectorConfigurationPage;
