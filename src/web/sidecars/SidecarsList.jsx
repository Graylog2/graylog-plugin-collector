import React from 'react';
import Reflux from 'reflux';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import naturalSort from 'javascript-natural-sort';

import { PaginatedList, Spinner } from 'components/common';

import SidecarsStore from './SidecarsStore';
import SidecarsActions from './SidecarsActions';
import SidecarRow from './SidecarRow';
import SidecarFilter from './SidecarFilter';

const SidecarList = React.createClass({
  mixins: [Reflux.connect(SidecarsStore)],

  getInitialState() {
    return {
      sidecars: undefined,
      filteredRows: undefined,
      sortBy: 'node_name',
      sortDesc: false,
      sort: (sidecar) => sidecar.node_id,
    };
  },
  componentDidMount() {
    this.style.use();
    this._reloadSidecars({});
    this.interval = setInterval(() => this._reloadSidecars({}), this.SIDECAR_DATA_REFRESH);
  },
  componentWillUnmount() {
    this.style.unuse();
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  style: require('!style/useable!css!styles/SidecarStyles.css'),
  SIDECAR_DATA_REFRESH: 5 * 1000,

  _reloadSidecars({ page, pageSize, onlyActive }) {
    if (!this.state.pagination) {
      SidecarsActions.listPaginated({ onlyActive: 'true' });
      return;
    }

    const effectivePageSize = pageSize || this.state.pagination.pageSize;
    const effectiveOnlyActive = onlyActive === undefined ? this.state.onlyActive : onlyActive; // Avoid || to handle false values
    let effectivePage = 1; // Reset page to 1 if other params changed
    if (effectivePageSize === this.state.pagination.pageSize && effectiveOnlyActive === this.state.onlyActive) {
      effectivePage = page || this.state.pagination.page;
    }

    SidecarsActions.listPaginated({
      query: '',
      page: effectivePage,
      pageSize: effectivePageSize,
      onlyActive: effectiveOnlyActive,
    });
  },

  _bySortField(sidecar1, sidecar2) {
    const sort = this.state.sort;
    const field1 = sort(sidecar1);
    const field2 = sort(sidecar2);
    return (this.state.sortDesc ? naturalSort(field2, field1) : naturalSort(field1, field2));
  },
  _getTableHeaderClassName(field) {
    return (this.state.sortBy === field ? (this.state.sortDesc ? 'sort-desc' : 'sort-asc') : 'sortable');
  },
  _formatSidecarList(sidecars) {
    return (
      <div className="table-responsive">
        <table className="table table-striped sidecars-list">
          <thead>
            <tr>
              <th className={this._getTableHeaderClassName('node_name')} onClick={this.sortByNodeName}>Name</th>
              <th className={this._getTableHeaderClassName('sidecar_status')} onClick={this.sortBySidecarStatus}>
                Status
              </th>
              <th className={this._getTableHeaderClassName('operating_system')} onClick={this.sortByOperatingSystem}>
                Operating System
              </th>
              <th className={this._getTableHeaderClassName('last_seen')} onClick={this.sortByLastSeen}>Last Seen</th>
              <th className={this._getTableHeaderClassName('node_id')} onClick={this.sortByNodeID}>
                Node Id
              </th>
              <th className={this._getTableHeaderClassName('sidecar_version')} onClick={this.sortBySidecarVersion}>
                Sidecar Version
              </th>
              <th className="actions">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {sidecars}
          </tbody>
        </table>
      </div>
    );
  },
  toggleShowInactive() {
    this._reloadSidecars({ onlyActive: !this.state.onlyActive });
  },
  sortByNodeId() {
    this.setState({
      sortBy: 'node_id',
      sortDesc: this.state.sortBy === 'node_id' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.node_id;
      },
    });
  },
  sortByNodeName() {
    this.setState({
      sortBy: 'node_name',
      sortDesc: this.state.sortBy === 'node_name' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.node_name;
      },
    });
  },
  sortByOperatingSystem() {
    this.setState({
      sortBy: 'operating_system',
      sortDesc: this.state.sortBy === 'operating_system' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.node_details.operating_system;
      },
    });
  },
  sortByLastSeen() {
    this.setState({
      sortBy: 'last_seen',
      sortDesc: this.state.sortBy === 'last_seen' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.last_seen;
      },
    });
  },
  sortBySidecarVersion() {
    this.setState({
      sortBy: 'sidecar_version',
      sortDesc: this.state.sortBy === 'sidecar_version' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.collector_version;
      },
    });
  },
  sortBySidecarStatus() {
    this.setState({
      sortBy: 'sidecar_status',
      sortDesc: this.state.sortBy === 'sidecar_status' && !this.state.sortDesc,
      sort: (sidecar) => {
        if (sidecar.status) {
          return sidecar.status.status;
        } else {
          return null;
        }
      },
    });
  },
  _formatEmptyListAlert() {
    const showInactiveHint = (this.state.onlyActive ? ' and/or click on "Include inactive sidecars"' : null);
    return <Alert>There are no sidecars to show. Try adjusting your search filter{showInactiveHint}.</Alert>;
  },
  _onFilterChange(filteredRows) {
    this.setState({ filteredRows });
  },
  handlePageChange(page, pageSize) {
    this._reloadSidecars({ page: page, pageSize: pageSize });
  },
  _isLoading() {
    return !this.state.sidecars;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const { pagination, onlyActive } = this.state;

    const sidecars = (this.state.filteredRows || this.state.sidecars)
      .sort(this._bySortField)
      .map((sidecar) => {
        return <SidecarRow key={sidecar.node_id} sidecar={sidecar} />;
      });

    const showOrHideInactive = (onlyActive ? 'Include' : 'Hide');

    const sidecarList = (sidecars.length > 0 ? this._formatSidecarList(sidecars) : this._formatEmptyListAlert());

    return (
      <div>
        <div className="sidecars-filter-form inline">
          <SidecarFilter label="Filter sidecars"
                         data={this.state.sidecars}
                         filterBy={'tags'}
                         displayKey={'tags'}
                         searchInKeys={['id', 'name', 'operating_system', 'tags', 'status']}
                         onDataFiltered={this._onFilterChange} />
        </div>
        <Button bsStyle="primary"
                bsSize="small"
                onClick={this.toggleShowInactive}>
          {showOrHideInactive} inactive sidecars
        </Button>
        <PaginatedList page={pagination.page}
                       pageSize={pagination.pageSize}
                       pageSizes={[1, 10, 25, 50, 100]}
                       totalItems={pagination.total}
                       onChange={this.handlePageChange}>
          <Row>
            <Col md={12}>
              {sidecarList}
            </Col>
          </Row>
        </PaginatedList>
      </div>
    );
  },
});

export default SidecarList;
