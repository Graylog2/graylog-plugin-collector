import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Button, Col, Row } from 'react-bootstrap';

import { DataTable } from 'components/common';
import BackendRow from './BackendRow';

import style from './BackendList.css';

const BackendList = createReactClass({
  propTypes: {
    backends: PropTypes.array.isRequired,
    onCreate: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  },

  headerCellFormatter(header) {
    const className = (header === 'Actions' ? style.actionsColumn : '');
    return <th className={className}>{header}</th>;
  },

  backendFormatter(backend) {
    const { onEdit, onClone, onDelete } = this.props;
    return <BackendRow backend={backend} onEdit={onEdit} onClone={onClone} onDelete={onDelete} />;
  },

  render() {
    const { backends, onCreate } = this.props;

    const headers = ['Name', 'Operating System', 'Actions'];
    const filterKeys = ['name', 'id', 'node_operating_system'];

    return (
      <div>
        <Row>
          <Col md={12}>
            <div className="pull-right">
              <Button bsStyle="success" bsSize="small" onClick={onCreate}>Create Backend</Button>
            </div>
            <h2>Backends <small>{backends.length} total</small></h2>
          </Col>
          <Col md={12}>
            <p>Manage Backends that you can configure and supervise through Collector Sidecar and Graylog Web Interface.</p>
          </Col>
        </Row>
        <DataTable id="backend-list"
                   className="table-hover"
                   headers={headers}
                   headerCellFormatter={this.headerCellFormatter}
                   sortByKey="name"
                   rows={backends}
                   filterBy="tag"
                   filterSuggestions={[]}
                   dataRowFormatter={this.backendFormatter}
                   filterLabel="Filter Backends"
                   noDataText="There are no backends to display, why don't you create one?"
                   filterKeys={filterKeys}
                   useResponsiveTable={false} />
      </div>
    );
  },
});

export default BackendList;
