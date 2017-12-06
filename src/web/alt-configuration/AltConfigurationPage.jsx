import PropTypes from 'prop-types';
import React from 'react';
import { Col, Row } from 'react-bootstrap';

import { PageHeader, Spinner } from 'components/common';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';

import AltConfigurationForm from 'alt-configuration/AltConfigurationForm';
import AltConfigurationTags from 'alt-configuration/AltConfigurationTags';
import ConfigurationHelper from 'alt-configuration/ConfigurationHelper';

const AltConfigurationPage = React.createClass({
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

    const title = <span>Collector Configuration</span>;

    return (
      <div>
        <PageHeader title={title}>
          <span>
            Some words about collector configurations.
          </span>

          <span>
            Read more about the Graylog  Sidecar in the documentation.
          </span>
        </PageHeader>

        <AltConfigurationTags configuration={this.state.configuration} tags={this.state.tags} />
        <Row className="content">
          <Col md={6}>
            <AltConfigurationForm configuration={this.state.configuration} />
          </Col>
          <Col md={6}>
            <ConfigurationHelper type="filebeat" />
          </Col>
        </Row>
      </div>
    );
  },
});

export default AltConfigurationPage;
