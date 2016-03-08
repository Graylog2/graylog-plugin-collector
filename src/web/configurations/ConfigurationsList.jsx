import React from 'react';
import Reflux from 'reflux';

import { DataTable, Spinner } from 'components/common';

import CollectorConfigurationsStore from './CollectorConfigurationsStore';
import ConfigurationRow from './ConfigurationRow';
import CollectorConfigurationsActions from './CollectorConfigurationsActions';
import CreateConfigurationModal from './CreateConfigurationModal';
import {} from '!style!css!styles/CollectorStyles.css';

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

  _createConfiguration(configuration, callback) {
    CollectorConfigurationsActions.createConfiguration.triggerPromise(configuration.name)
      .then(() => {
        callback();
        this._reloadConfiguration();
      });
  },

  _onDelete(configuration) {
    CollectorConfigurationsActions.delete.triggerPromise(configuration)
      .then(() => {
        this._reloadConfiguration();
      });
  },

  _headerCellFormatter(header) {
    const className = (header === 'Actions' ? 'actions' : '');
    return <th className={className}>{header}</th>;
  },

  _collectorConfigurationFormatter(configuration) {
    return <ConfigurationRow key={configuration.id} configuration={configuration} onDelete={this._onDelete} />;
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
        <DataTable id="collector-configurations-list"
                   className="table-hover"
                   headers={headers}
                   headerCellFormatter={this._headerCellFormatter}
                   sortByKey="name"
                   rows={this.state.configurations}
                   filterBy="Name"
                   dataRowFormatter={this._collectorConfigurationFormatter}
                   filterLabel="Filter Configurations"
                   noDataText="There are no configurations to display, why don't you create one?"
                   filterKeys={filterKeys}>
          <CreateConfigurationModal saveConfiguration={this._createConfiguration}
                                    validConfigurationName={this._validConfigurationName} />
        </DataTable>
      </div>
    );
  },
});

export default ConfigurationsList;
