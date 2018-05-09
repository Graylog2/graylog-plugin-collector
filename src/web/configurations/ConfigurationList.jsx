import React from 'react';
import Reflux from 'reflux';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DataTable, Spinner } from 'components/common';
import Routes from 'routing/Routes';

import CollectorConfigurationsStore from './CollectorConfigurationsStore';
import CollectorConfigurationsActions from './CollectorConfigurationsActions';
import CollectorsStore from './CollectorsStore';
import CollectorsActions from './CollectorsActions';
import ConfigurationRow from './ConfigurationRow';

import style from './ConfigurationList.css';

const ConfigurationList = React.createClass({
  mixins: [Reflux.connect(CollectorConfigurationsStore), Reflux.connect(CollectorsStore)],

  componentDidMount() {
    this._reloadConfiguration();
  },

  _reloadConfiguration() {
    CollectorConfigurationsActions.list();
    CollectorsActions.list();
  },

  _validConfigurationName(name) {
    // Check if configurations already contain a configuration with the given name.
    return !this.state.configurations.some((configuration) => configuration.name === name);
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
    const configurationCollector = this.state.collectors.find(collector => collector.id === configuration.backend_id);
    return (
      <ConfigurationRow key={configuration.id}
                        configuration={configuration}
                        collector={configurationCollector}
                        onCopy={this._copyConfiguration}
                        validateConfiguration={this._validConfigurationName}
                        onDelete={this._onDelete} />
    );
  },

  _isLoading() {
    return !this.state.configurations || !this.state.collectors;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const headers = ['Configuration', 'Color', 'Collector', 'Actions'];
    const filterKeys = ['name', 'id'];

    return (
      <div>
        <Row>
          <Col md={12}>
            <div className="pull-right">
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_CONFIGURATION_NEW')}>
                <Button onClick={this.openModal} bsStyle="success" bsSize="small">Create Configuration</Button>
              </LinkContainer>
            </div>
            <h2>Configurations <small>{this.state.configurations.length} total</small></h2>
          </Col>
          <Col md={12}>
            <p>
              These are the Configurations to use in your Collectors. Remember to apply new configurations to
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

export default ConfigurationList;
