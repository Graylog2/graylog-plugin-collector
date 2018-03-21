import React from 'react';
import Reflux from 'reflux';
import { Col, Row } from 'react-bootstrap';

import { DataTable, Spinner } from 'components/common';

import CollectorConfigurationsStore from './CollectorConfigurationsStore';
import ConfigurationRow from './ConfigurationRow';
import CollectorConfigurationsActions from './CollectorConfigurationsActions';
import EditConfigurationModal from './EditConfigurationModal';

import style from './ConfigurationsList.css';

const ConfigurationsList = React.createClass({
  mixins: [Reflux.connect(CollectorConfigurationsStore)],

  componentDidMount() {
    this._reloadConfiguration();
  },

  _reloadConfiguration() {
    CollectorConfigurationsActions.list();
  },

  _validConfigurationName(name) {
    // Check if configurations already contain a configuration with the given name.
    return !this.state.configurations.some((configuration) => configuration.name === name);
  },

  _createConfiguration(name, backendId, callback) {
    CollectorConfigurationsActions.createConfiguration(name, backendId)
      .then(() => {
        callback();
      });
  },

  _updateConfiguration(configuration, callback) {
    CollectorConfigurationsActions.updateConfiguration(configuration)
      .then(() => {
        callback();
      });
  },

  _copyConfiguration(configuration, name, callback) {
    CollectorConfigurationsActions.copyConfiguration(configuration, name)
      .then(() => {
        callback();
      });
  },

  _onDelete(configuration) {
    CollectorConfigurationsActions.delete(configuration);
  },

  _headerCellFormatter(header) {
    const className = (header === 'Actions' ? style.actionsColumn : '');
    return <th className={className}>{header}</th>;
  },

  _collectorConfigurationFormatter(configuration) {
    return (
      <ConfigurationRow key={configuration.id}
                        configuration={configuration}
                        onUpdate={this._updateConfiguration}
                        onCopy={this._copyConfiguration}
                        validateConfiguration={this._validConfigurationName}
                        onDelete={this._onDelete} />
    );
  },

  _isLoading() {
    return !this.state.configurations;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const headers = ['Configuration', 'Tags', 'Actions'];
    const filterKeys = ['name', 'id'];

    return (
      <div>
        <Row>
          <Col md={12}>
            <div className="pull-right">
              <EditConfigurationModal create
                                      updateConfiguration={this._createConfiguration}
                                      validConfigurationName={this._validConfigurationName} />
            </div>
            <h2>Configurations <small>{this.state.configurations.length} total</small></h2>
          </Col>
          <Col md={12}>
            <p>
              These are the Configurations to use in your Collector Backends. Remember to apply new configurations to
              Collectors in the Administration page.
            </p>
          </Col>
        </Row>
        <DataTable id="collector-configurations-list"
                   className="table-hover"
                   headers={headers}
                   headerCellFormatter={this._headerCellFormatter}
                   sortByKey="name"
                   rows={this.state.configurations}
                   filterBy="tag"
                   filterSuggestions={this.state.tags}
                   dataRowFormatter={this._collectorConfigurationFormatter}
                   filterLabel="Filter Configurations"
                   noDataText="There are no configurations to display, why don't you create one?"
                   filterKeys={filterKeys}
                   useResponsiveTable={false} />
      </div>
    );
  },
});

export default ConfigurationsList;
