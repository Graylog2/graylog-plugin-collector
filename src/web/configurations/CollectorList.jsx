import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Button, Col, Row } from 'react-bootstrap';

import { DataTable } from 'components/common';
import CollectorRow from './CollectorRow';

import style from './CollectorList.css';

const CollectorList = createReactClass({
  propTypes: {
    collectors: PropTypes.array.isRequired,
    onCreate: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  },

  headerCellFormatter(header) {
    const className = (header === 'Actions' ? style.actionsColumn : '');
    return <th className={className}>{header}</th>;
  },

  collectorFormatter(collector) {
    const { onEdit, onClone, onDelete } = this.props;
    return <CollectorRow collector={collector} onEdit={onEdit} onClone={onClone} onDelete={onDelete} />;
  },

  render() {
    const { collectors, onCreate } = this.props;

    const headers = ['Name', 'Operating System', 'Actions'];
    const filterKeys = ['name', 'id', 'node_operating_system'];

    return (
      <div>
        <Row>
          <Col md={12}>
            <div className="pull-right">
              <Button bsStyle="success" bsSize="small" onClick={onCreate}>Create Log Collector</Button>
            </div>
            <h2>Log Collectors <small>{collectors.length} total</small></h2>
          </Col>
          <Col md={12}>
            <p>Manage Log Collectors that you can configure and supervise through Graylog Sidecar and Graylog Web Interface.</p>
          </Col>
        </Row>
        <DataTable id="collector-list"
                   className="table-hover"
                   headers={headers}
                   headerCellFormatter={this.headerCellFormatter}
                   sortByKey="name"
                   rows={collectors}
                   filterBy="tag"
                   filterSuggestions={[]}
                   dataRowFormatter={this.collectorFormatter}
                   filterLabel="Filter Log Collectors"
                   noDataText="There are no log collectors to display, why don't you create one?"
                   filterKeys={filterKeys}
                   useResponsiveTable={false} />
      </div>
    );
  },
});

export default CollectorList;
