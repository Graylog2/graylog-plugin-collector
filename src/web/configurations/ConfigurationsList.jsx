import React from 'react';
import Reflux from 'reflux';

import { DataTable, Spinner } from 'components/common';

import CollectorConfigurationsStore from './CollectorConfigurationsStore';
import ConfigurationRow from './ConfigurationRow';
import CollectorConfigurationsActions from './CollectorConfigurationsActions';
import EditConfigurationModal from './EditConfigurationModal';

const ConfigurationsList = React.createClass({
  mixins: [Reflux.connect(CollectorConfigurationsStore)],

  componentDidMount() {
    this.style.use();
    this._reloadConfiguration();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/CollectorStyles.css'),

  _reloadConfiguration() {
    CollectorConfigurationsActions.list.triggerPromise().then((configurations) => {
      const tags = configurations
        .map(configuration => configuration.tags)
        .reduce((uniqueTags, currentTags) => {
          currentTags.forEach(tag => {
            if (uniqueTags.indexOf(tag) === -1) {
              uniqueTags.push(tag);
            }
          });

          return uniqueTags;
        }, []);
      this.setState({ tags });
    });
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

  _updateConfiguration(configuration, callback) {
    CollectorConfigurationsActions.updateConfiguration.triggerPromise(configuration)
      .then(() => {
        callback();
        this._reloadConfiguration();
      });
  },

  _copyConfiguration(configuration, name, callback) {
    CollectorConfigurationsActions.copyConfiguration.triggerPromise(configuration, name)
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
    return (
      <ConfigurationRow key={configuration.id} configuration={configuration} onUpdate={this._updateConfiguration}
                        onCopy={this._copyConfiguration} validateConfiguration={this._validConfigurationName}
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
                   filterKeys={filterKeys}>
          <div className="pull-right">
            <EditConfigurationModal create updateConfiguration={this._createConfiguration}
                                    validConfigurationName={this._validConfigurationName}/>
          </div>
        </DataTable>
      </div>
    );
  },
});

export default ConfigurationsList;
