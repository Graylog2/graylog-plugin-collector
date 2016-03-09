import React from 'react';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { PageHeader, Spinner } from 'components/common';
import CollectorConfiguration from './CollectorConfiguration';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';

const CollectorConfigurationPage = React.createClass({
  propTypes: {
    params: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      configuration: undefined,
      tags: undefined,
    };
  },

  componentDidMount() {
    this._reloadConfiguration();
    this._loadTags();
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

    return (
      <div>
        <PageHeader title={<span>Collector <em>{this.state.configuration.name}</em> Configuration</span>}
                    titleSize={8} buttonSize={4}
                    buttonStyle={{ textAlign: 'right', marginTop: 10 }}>
          <span>
            Use this page to review and manage the configuration for this collector.
          </span>

          <span>
            Read more about collector configurations in the <a>Graylog documentation</a>.
          </span>

          <span>
            <LinkContainer to={'/system/collectors/configurations'}>
              <Button bsStyle="info">Manage Configurations</Button>
            </LinkContainer>
          </span>
        </PageHeader>
        <CollectorConfiguration configuration={this.state.configuration} tags={this.state.tags}
                                onConfigurationChange={this._reloadConfiguration} />
      </div>
    );
  },
});

export default CollectorConfigurationPage;
