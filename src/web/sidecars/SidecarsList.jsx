import React from 'react';
import Reflux from 'reflux';
import { Row, Col, Alert, Button } from 'react-bootstrap';

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

  _reloadSidecars({ page, pageSize, onlyActive, sortField, order }) {
    const effectiveSortField = sortField || this.state.sortField;
    const effectiveOrder = order || this.state.order;

    const options = {
      query: '',
      onlyActive: 'true',
      sortField: effectiveSortField,
      order: effectiveOrder,
    };

    if (this.state.pagination) {
      options.pageSize = pageSize || this.state.pagination.pageSize;
      options.onlyActive = onlyActive === undefined ? this.state.onlyActive : onlyActive; // Avoid || to handle false values
      let effectivePage = 1; // Reset page to 1 if other params changed
      if (options.pageSize === this.state.pagination.pageSize && options.onlyActive === this.state.onlyActive) {
        effectivePage = page || this.state.pagination.page;
      }
      options.page = effectivePage;
    }

    SidecarsActions.listPaginated(options);
  },

  _getTableHeaderClassName(field) {
    return (this.state.sortField === field ? `sort-${this.state.order}` : 'sortable');
  },
  _formatSidecarList(sidecars) {
    return (
      <div className="table-responsive">
        <table className="table table-striped sidecars-list">
          <thead>
            <tr>
              <th className={this._getTableHeaderClassName('node_name')} onClick={this.sortBy('node_name')}>Name</th>
              <th className={this._getTableHeaderClassName('node_details.status.status')} onClick={this.sortBy('node_details.status.status')}>
                Status
              </th>
              <th className={this._getTableHeaderClassName('node_details.operating_system')} onClick={this.sortBy('node_details.operating_system')}>
                Operating System
              </th>
              <th className={this._getTableHeaderClassName('last_seen')} onClick={this.sortBy('last_seen')}>Last Seen</th>
              <th className={this._getTableHeaderClassName('node_id')} onClick={this.sortBy('node_id')}>
                Node Id
              </th>
              <th className={this._getTableHeaderClassName('collector_version')} onClick={this.sortBy('collector_version')}>
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
  sortBy(field) {
    return () => {
      this._reloadSidecars({
        sortField: field,
        order: (this.state.sortField === field ? (this.state.order === 'asc' ? 'desc' : 'asc') : 'asc'),
      });
    };
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
        <PaginatedList activePage={pagination.page}
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
