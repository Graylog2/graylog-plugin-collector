import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DataTable, PaginatedList } from 'components/common';
import Routes from 'routing/Routes';

import ConfigurationRow from './ConfigurationRow';

import style from './ConfigurationList.css';

const ConfigurationList = React.createClass({
  propTypes: {
    collectors: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    validateConfiguration: PropTypes.func.isRequired,
  },

  _headerCellFormatter(header) {
    const className = (header === 'Actions' ? style.actionsColumn : '');
    return <th className={className}>{header}</th>;
  },

  _collectorConfigurationFormatter(configuration) {
    const { collectors, onClone, onDelete, validateConfiguration } = this.props;
    const configurationCollector = collectors.find(collector => collector.id === configuration.backend_id);
    return (
      <ConfigurationRow key={configuration.id}
                        configuration={configuration}
                        collector={configurationCollector}
                        onCopy={onClone}
                        validateConfiguration={validateConfiguration}
                        onDelete={onDelete} />
    );
  },

  render() {
    const { configurations, pagination, onPageChange } = this.props;
    const headers = ['Configuration', 'Color', 'Collector', 'Actions'];

    return (
      <div>
        <Row>
          <Col md={12}>
            <div className="pull-right">
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_CONFIGURATION_NEW')}>
                <Button onClick={this.openModal} bsStyle="success" bsSize="small">Create Configuration</Button>
              </LinkContainer>
            </div>
            <h2>Configurations <small>{configurations.length} total</small></h2>
          </Col>
          <Col md={12}>
            <p>
              These are the Configurations to use in your Collectors. Remember to apply new configurations to
              Collectors in the Administration page.
            </p>
          </Col>
        </Row>

        <PaginatedList activePage={pagination.page}
                       pageSize={pagination.pageSize}
                       pageSizes={[10, 25]}
                       totalItems={pagination.total}
                       onChange={onPageChange}>
          <DataTable id="collector-configurations-list"
                     className="table-hover"
                     headers={headers}
                     headerCellFormatter={this._headerCellFormatter}
                     sortByKey="name"
                     rows={configurations}
                     dataRowFormatter={this._collectorConfigurationFormatter}
                     filterLabel=""
                     noDataText="There are no configurations to display, why don't you create one?"
                     filterKeys={[]}
                     useResponsiveTable={false} />
        </PaginatedList>
      </div>
    );
  },
});

export default ConfigurationList;
