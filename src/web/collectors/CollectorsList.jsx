import React from 'react';
import Reflux from 'reflux';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import naturalSort from 'javascript-natural-sort';

import { Spinner } from 'components/common';

import CollectorsStore from './CollectorsStore';
import CollectorsActions from './CollectorsActions';
import CollectorRow from './CollectorRow';
import CollectorFilter from './CollectorFilter';

const CollectorList = React.createClass({
  mixins: [Reflux.connect(CollectorsStore)],

  getInitialState() {
    return {
      collectors: undefined,
      filteredRows: undefined,
      sortBy: 'node_id',
      sortDesc: false,
      sort: (collector) => collector.node_id,
      showInactive: false,
    };
  },
  componentDidMount() {
    this.style.use();
    this._reloadCollectors();
    this.interval = setInterval(this._reloadCollectors, this.COLLECTOR_DATA_REFRESH);
  },
  componentWillUnmount() {
    this.style.unuse();
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  style: require('!style/useable!css!styles/CollectorStyles.css'),
  COLLECTOR_DATA_REFRESH: 5 * 1000,

  _reloadCollectors() {
    CollectorsActions.list.triggerPromise().then(this._setCollectors);
  },
  _setCollectors(collectors) {
    this.setState({collectors: collectors.collectors});
  },
  _bySortField(collector1, collector2) {
    const sort = this.state.sort;
    const field1 = sort(collector1);
    const field2 = sort(collector2);
    return (this.state.sortDesc ? naturalSort(field2, field1) : naturalSort(field1, field2));
  },
  _getTableHeaderClassName(field) {
    return (this.state.sortBy === field ? (this.state.sortDesc ? 'sort-desc' : 'sort-asc') : 'sortable');
  },
  _formatCollectorList(collectors) {
    return (
      <div className="table-responsive">
        <table className="table table-striped collectors-list">
          <thead>
          <tr>
            <th className={this._getTableHeaderClassName('node_id')} onClick={this.sortByNodeId}>Name</th>
            <th className={this._getTableHeaderClassName('collector_status')} onClick={this.sortByCollectorStatus}>
              Status
            </th>
            <th className={this._getTableHeaderClassName('operating_system')} onClick={this.sortByOperatingSystem}>
              Operating System
            </th>
            <th className={this._getTableHeaderClassName('last_seen')} onClick={this.sortByLastSeen}>Last Seen</th>
            <th className={this._getTableHeaderClassName('id')} onClick={this.sortById}>
              Collector Id
            </th>
            <th className={this._getTableHeaderClassName('collector_version')} onClick={this.sortByCollectorVersion}>
              Collector Version
            </th>
            <th className="actions">&nbsp;</th>
          </tr>
          </thead>
          <tbody>
          {collectors}
          </tbody>
        </table>
      </div>
    );
  },
  toggleShowInactive() {
    this.setState({ showInactive: !this.state.showInactive });
  },
  sortById() {
    this.setState({
      sortBy: 'id',
      sortDesc: this.state.sortBy === 'id' && !this.state.sortDesc,
      sort: (collector) => {
        return collector.id;
      },
    });
  },
  sortByNodeId() {
    this.setState({
      sortBy: 'node_id',
      sortDesc: this.state.sortBy === 'node_id' && !this.state.sortDesc,
      sort: (collector) => {
        return collector.node_id;
      },
    });
  },
  sortByOperatingSystem() {
    this.setState({
      sortBy: 'operating_system',
      sortDesc: this.state.sortBy === 'operating_system' && !this.state.sortDesc,
      sort: (collector) => {
        return collector.node_details.operating_system;
      },
    });
  },
  sortByLastSeen() {
    this.setState({
      sortBy: 'last_seen',
      sortDesc: this.state.sortBy === 'last_seen' && !this.state.sortDesc,
      sort: (collector) => {
        return collector.last_seen;
      },
    });
  },
  sortByCollectorVersion() {
    this.setState({
      sortBy: 'collector_version',
      sortDesc: this.state.sortBy === 'collector_version' && !this.state.sortDesc,
      sort: (collector) => {
        return collector.collector_version;
      },
    });
  },
  sortByCollectorStatus() {
    this.setState({
      sortBy: 'collector_status',
      sortDesc: this.state.sortBy === 'collector_status' && !this.state.sortDesc,
      sort: (collector) => {
        if (collector.status) {
          return collector.status.status;
        } else {
          return null;
        }
      },
    });
  },
  _formatEmptyListAlert() {
    const showInactiveHint = (this.state.showInactive ? null : ' and/or click on "Include inactive collectors"');
    return <Alert>There are no collectors to show. Try adjusting your search filter{showInactiveHint}.</Alert>;
  },
  _onFilterChange(filteredRows) {
    this.setState({ filteredRows });
  },
  _isLoading() {
    return !this.state.collectors;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const collectors = (this.state.filteredRows || this.state.collectors)
      .filter((collector) => {
        return (this.state.showInactive || collector.active);
      })
      .sort(this._bySortField)
      .map((collector) => {
        return <CollectorRow key={collector.id} collector={collector} />;
      });

    const showOrHideInactive = (this.state.showInactive ? 'Hide' : 'Include');

    const collectorList = (collectors.length > 0 ? this._formatCollectorList(collectors) : this._formatEmptyListAlert());

    return (
      <Row>
        <Col md={12}>
          <div className="pull-right">
            <Button bsStyle="primary" bsSize="small" onClick={this.toggleShowInactive}>
              {showOrHideInactive} inactive collectors
            </Button>
          </div>
          <div className="form-inline collectors-filter-form">
            <CollectorFilter label="Filter collectors"
                             data={this.state.collectors}
                             filterBy={'tags'}
                             displayKey={'tags'}
                             searchInKeys={['id', 'name', 'operating_system', 'tags', 'status']}
                             onDataFiltered={this._onFilterChange} />
          </div>
          {collectorList}
        </Col>
      </Row>
    );
  },
});

export default CollectorList;
