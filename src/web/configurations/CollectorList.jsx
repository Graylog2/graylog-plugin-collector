import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DataTable, PaginatedList } from 'components/common';
import Routes from 'routing/Routes';
import CollectorRow from './CollectorRow';

import style from './CollectorList.css';

const CollectorList = createReactClass({
  propTypes: {
    collectors: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    onClone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
    validateCollector: PropTypes.func.isRequired,
  },

  headerCellFormatter(header) {
    const className = (header === 'Actions' ? style.actionsColumn : '');
    return <th className={className}>{header}</th>;
  },

  collectorFormatter(collector) {
    const { onClone, onDelete, validateCollector } = this.props;
    return (<CollectorRow collector={collector}
                          onClone={onClone}
                          onDelete={onDelete}
                          validateCollector={validateCollector} />);
  },

  render() {
    const { collectors, pagination, onPageChange } = this.props;

    const headers = ['Name', 'Operating System', 'Actions'];

    return (
      <div>
        <Row>
          <Col md={12}>
            <div className="pull-right">
              <LinkContainer to={Routes.pluginRoute('SYSTEM_SIDECARS_COLLECTOR_NEW')}>
                <Button bsStyle="success" bsSize="small">Create Log Collector</Button>
              </LinkContainer>
            </div>
            <h2>Log Collectors <small>{collectors.length} total</small></h2>
          </Col>
          <Col md={12}>
            <p>Manage Log Collectors that you can configure and supervise through Graylog Sidecar and Graylog Web Interface.</p>
          </Col>
        </Row>

        <Row className={`row-sm ${style.configurationRow}`}>
          <Col md={12}>
            <PaginatedList activePage={pagination.page}
                           pageSize={pagination.pageSize}
                           pageSizes={[1, 10, 25]}
                           totalItems={pagination.total}
                           onChange={onPageChange}>
              <div className={style.configurationTable}>
                <DataTable id="collector-list"
                           className="table-hover"
                           headers={headers}
                           headerCellFormatter={this.headerCellFormatter}
                           rows={collectors}
                           dataRowFormatter={this.collectorFormatter}
                           noDataText="There are no log collectors to display, why don't you create one?"
                           filterLabel=""
                           filterKeys={[]}
                           useResponsiveTable={false} />
              </div>
            </PaginatedList>
          </Col>
        </Row>
      </div>
    );
  },
});

export default CollectorList;
