import React from 'react';
import Reflux from 'reflux';
import { Alert, Button, Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';

import { PaginatedList, SearchForm, Spinner } from 'components/common';

import SidecarsStore from './SidecarsStore';
import SidecarsActions from './SidecarsActions';
import SidecarRow from './SidecarRow';

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
    const effectiveSortField = sortField || this.state.sortField;
    const effectiveOrder = order || this.state.order;

    const options = {
      query: effectiveQuery,
      onlyActive: 'true',
      sortField: effectiveSortField,
      order: effectiveOrder,
    };

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
    return (this.state.sortField === field ? `sort-${this.state.order}` : 'sortable');
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
        order: (this.state.sortField === field ? (this.state.order === 'asc' ? 'desc' : 'asc') : 'asc'),
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

    const queryHelpPopover = (
      <Popover id="search-query-help" className="popover-wide" title="Search Syntax Help">
        <p><strong>Available search fields</strong></p>
        <Table condensed>
          <thead>
            <tr>
              <th>Field</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>name</td>
              <td>Sidecar name</td>
            </tr>
            <tr>
              <td>status</td>
              <td>Status of the sidecar as it appears in the list, i.e. running, failing, or unknown</td>
            </tr>
            <tr>
              <td>operating_system</td>
              <td>Operating system the sidecar is running on</td>
            </tr>
            <tr>
              <td>last_seen</td>
              <td>Date and time when the sidecar last communicated with Graylog</td>
            </tr>
            <tr>
              <td>node_id</td>
              <td>Identifier of the sidecar</td>
            </tr>
            <tr>
              <td>collector_version</td>
              <td>Sidecar version</td>
            </tr>
          </tbody>
        </Table>
        <p><strong>Examples</strong></p>
        <p>
          Find sidecars that did not communicate with Graylog since a date:<br />
          <kbd>{'last_seen:<=2018-04-10'}</kbd><br />
        </p>
        <p>
          Find sidecars with <code>failing</code> or <code>unknown</code> status:<br />
          <kbd>{'status:failing status:unknown'}</kbd><br />
        </p>
      </Popover>
    );

    const queryHelp = (
      <OverlayTrigger trigger="click" rootClose placement="right" overlay={queryHelpPopover}>
        <Button bsStyle="link"><i className="fa fa-question-circle" /></Button>
      </OverlayTrigger>
    );

    return (
      <div>
        <div className="sidecars-filter-form inline">
          <SearchForm query={query}
                      onSearch={this.handleSearchChange}
                      onReset={this.handleSearchReset}
                      searchButtonLabel="Find"
                      placeholder="Find sidecars"
                      queryWidth={400}
                      queryHelpComponent={queryHelp}
                      useLoadingState>
            <Button bsStyle="primary"
                    onClick={this.toggleShowInactive}
                    className="inactive-sidecars-button">
              {showOrHideInactive} inactive sidecars
            </Button>
          </SearchForm>
        </div>

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
