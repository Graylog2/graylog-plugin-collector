/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import { defaultCompare as naturalSort } from 'logic/DefaultCompare';
import styled from 'styled-components';

import { Alert, Button, Col, Row, Table } from 'components/bootstrap';
import { Icon, Spinner } from 'components/common';

import CollectorsStore from './CollectorsStore';
import CollectorsActions from './CollectorsActions';
import CollectorRow from './CollectorRow';
import CollectorFilter from './CollectorFilter';

const StyledTable = styled(Table)`
  margin-top: 15px;
  margin-bottom: 0px;
`;

const StyledIcon = styled(Icon)(({ $isAlwaysVisible }) => `
  margin-left: 5px;
  visibility: ${$isAlwaysVisible ? 'visible' : 'hidden'}
`);

const SortableTh = styled.th`
  cursor: pointer;

  &:hover ${StyledIcon} {
    visibility: visible;
  }
`;

const CollectorList = createReactClass({
  displayName: 'CollectorList',
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
    this._reloadCollectors();
    this.interval = setInterval(this._reloadCollectors, this.COLLECTOR_DATA_REFRESH);
  },

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  COLLECTOR_DATA_REFRESH: 5 * 1000,

  _reloadCollectors() {
    CollectorsActions.list.triggerPromise().then(this._setCollectors);
  },

  _setCollectors(collectors) {
    this.setState({ collectors: collectors.collectors });
  },

  _bySortField(collector1, collector2) {
    const { sort } = this.state;
    const field1 = sort(collector1);
    const field2 = sort(collector2);

    return (this.state.sortDesc ? naturalSort(field2, field1) : naturalSort(field1, field2));
  },

  _getSortingIcon(field) {
    const { sortBy, sortDesc } = this.state;
    const name = (sortBy === field ? (sortDesc ? 'sort-amount-up' : 'sort-amount-down') : 'sort');

    return <StyledIcon name={name} fixedWidth $isAlwaysVisible={sortBy === field} />;
  },

  _formatCollectorList(collectors) {
    return (
      <div className="table-responsive">
        <StyledTable striped>
          <thead>
            <tr>
              <SortableTh onClick={this.sortByNodeId}>
                Name
                {this._getSortingIcon('node_id')}
              </SortableTh>
              <SortableTh onClick={this.sortByCollectorStatus}>
                Status
                {this._getSortingIcon('collector_status')}
              </SortableTh>
              <SortableTh onClick={this.sortByOperatingSystem}>
                Operating System
                {this._getSortingIcon('operating_system')}
              </SortableTh>
              <SortableTh onClick={this.sortByLastSeen}>
                Last Seen
                {this._getSortingIcon('last_seen')}
              </SortableTh>
              <SortableTh onClick={this.sortById}>
                Collector Id
                {this._getSortingIcon('id')}
              </SortableTh>
              <SortableTh onClick={this.sortByCollectorVersion}>
                Collector Version
                {this._getSortingIcon('collector_version')}
              </SortableTh>
              <th className="actions">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {collectors}
          </tbody>
        </StyledTable>
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
        }

        return null;
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
          <CollectorFilter label="Filter collectors"
                           data={this.state.collectors}
                           filterBy="tags"
                           displayKey="tags"
                           searchInKeys={['id', 'name', 'operating_system', 'tags', 'status']}
                           onDataFiltered={this._onFilterChange} />
          {collectorList}
        </Col>
      </Row>
    );
  },
});

export default CollectorList;
