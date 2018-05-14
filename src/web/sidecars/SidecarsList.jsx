import React from 'react';
import Reflux from 'reflux';
import { Alert, Button, Col, Row, Table } from 'react-bootstrap';

import { PaginatedList, Spinner } from 'components/common';

import SidecarsStore from './SidecarsStore';
import SidecarsActions from './SidecarsActions';
import SidecarRow from './SidecarRow';
import SidecarSearchForm from '../common/SidecarSearchForm';

const SidecarList = React.createClass({
  mixins: [Reflux.connect(SidecarsStore)],

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

  _reloadSidecars({ query, page, pageSize, onlyActive, sortField, order }) {
    const effectiveQuery = query === undefined ? this.state.query : query;

    const options = {
      query: effectiveQuery,
      onlyActive: 'true',
    };

    if (this.state.sort) {
      options.sortField = sortField || this.state.sort.field;
      options.order = order || this.state.sort.order;
    }

    if (this.state.pagination) {
      options.pageSize = pageSize || this.state.pagination.pageSize;
      options.onlyActive = onlyActive === undefined ? this.state.onlyActive : onlyActive; // Avoid || to handle false values
      const shouldKeepPage = options.pageSize === this.state.pagination.pageSize &&
        options.onlyActive === this.state.onlyActive &&
        options.query === this.state.query; // Only keep page number when other parameters don't change
      let effectivePage = 1;
      if (shouldKeepPage) {
        effectivePage = page || this.state.pagination.page;
      }
      options.page = effectivePage;
    }

    return SidecarsActions.listPaginated(options);
  },

  _getTableHeaderClassName(field) {
    return (this.state.sort.field === field ? `sort-${this.state.sort.order}` : 'sortable');
  },
  _formatSidecarList(sidecars) {
    return (
      <Table striped responsive className="sidecars-list">
        <thead>
          <tr>
            <th className={this._getTableHeaderClassName('node_name')}
                onClick={this.sortBy('node_name')}>Name
            </th>
            <th className={this._getTableHeaderClassName('node_details.status.status')}
                onClick={this.sortBy('node_details.status.status')}>
              Status
            </th>
            <th className={this._getTableHeaderClassName('node_details.operating_system')}
                onClick={this.sortBy('node_details.operating_system')}>
              Operating System
            </th>
            <th className={this._getTableHeaderClassName('last_seen')}
                onClick={this.sortBy('last_seen')}>Last Seen
            </th>
            <th className={this._getTableHeaderClassName('node_id')}
                onClick={this.sortBy('node_id')}>
              Node Id
            </th>
            <th className={this._getTableHeaderClassName('collector_version')}
                onClick={this.sortBy('collector_version')}>
              Sidecar Version
            </th>
            <th className="actions">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {sidecars}
        </tbody>
      </Table>
    );
  },
  toggleShowInactive() {
    this._reloadSidecars({ onlyActive: !this.state.onlyActive });
  },
  sortBy(field) {
    return () => {
      this._reloadSidecars({
        sortField: field,
        order: (this.state.sort.field === field ? (this.state.sort.order === 'asc' ? 'desc' : 'asc') : 'asc'),
      });
    };
  },
  _formatEmptyListAlert() {
    const showInactiveHint = (this.state.onlyActive ? ' and/or click on "Include inactive sidecars"' : null);
    return <Alert>There are no sidecars to show. Try adjusting your search filter{showInactiveHint}.</Alert>;
  },

  handlePageChange(page, pageSize) {
    this._reloadSidecars({ page: page, pageSize: pageSize });
  },

  handleSearchChange(query, callback) {
    this._reloadSidecars({ query: query }).finally(callback);
  },

  handleSearchReset() {
    this._reloadSidecars({ query: '' });
  },

  _isLoading() {
    return !this.state.sidecars;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const { onlyActive, pagination, query } = this.state;
    const sidecars = this.state.sidecars.map(sidecar => <SidecarRow key={sidecar.node_id} sidecar={sidecar} />);
    const showOrHideInactive = (onlyActive ? 'Include' : 'Hide');
    const sidecarList = (sidecars.length > 0 ? this._formatSidecarList(sidecars) : this._formatEmptyListAlert());

    return (
      <div>
        <div className="sidecars-filter-form inline">
          <SidecarSearchForm query={query}
                             onSearch={this.handleSearchChange}
                             onReset={this.handleSearchReset}>
            <Button bsStyle="primary"
                    onClick={this.toggleShowInactive}
                    className="inactive-sidecars-button">
              {showOrHideInactive} inactive sidecars
            </Button>
          </SidecarSearchForm>
        </div>

        <PaginatedList activePage={pagination.page}
                       pageSize={pagination.pageSize}
                       pageSizes={[10, 25, 50, 100]}
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
