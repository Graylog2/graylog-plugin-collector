import React from 'react';
import Reflux from 'reflux';
import { Row, Col, Alert, Button } from 'react-bootstrap';

import { Spinner } from 'components/common';

import CollectorsStore from './CollectorsStore';
import CollectorsActions from './CollectorsActions';
import CollectorRow from './CollectorRow';
import {} from '!style!css!styles/CollectorStyles.css';

const CollectorList = React.createClass({
  mixins: [Reflux.connect(CollectorsStore)],

  getInitialState() {
    return {
      filter: '',
      sort: undefined,
      showInactive: false,
    };
  },
  componentDidMount() {
    CollectorsActions.list();
    this.interval = setInterval(CollectorsActions.list, this.COLLECTOR_DATA_REFRESH);
  },
  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  COLLECTOR_DATA_REFRESH: 5 * 1000,

  _getFilteredCollectors() {
    const filter = this.state.filter.toLowerCase().trim();
    return this.state.collectors.filter((collector) => {
      return !filter || collector.id.toLowerCase().indexOf(filter) !== -1 || collector.node_id.toLowerCase().indexOf(filter) !== -1 || collector.node_details.operating_system.toLowerCase().indexOf(filter) !== -1;
    });
  },
  _bySortField(collector1, collector2) {
    const sort = this.state.sort || ((collector) => collector.id);
    const field1 = sort(collector1);
    const field2 = sort(collector2);
    if (typeof(field1) === 'number') {
      return field2 - field1;
    }

    return field1.localeCompare(field2);
  },
  _formatCollectorList(collectors) {
    return (
      <div className="table-responsive">
        <table className="table table-striped collectors-list">
          <thead>
          <tr>
            <th onClick={this.sortByNodeId}>Host Name</th>
            <th onClick={this.sortByOperatingSystem}>Operating System</th>
            <th onClick={this.sortByLastSeen}>Last Seen</th>
            <th className="name" onClick={this.sortById}>
              Collector Id
            </th>
            <th onClick={this.sortByCollectorVersion}>Collector Version</th>
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
      sort: (collector) => {
        return collector.id;
      },
    });
  },
  sortByNodeId() {
    this.setState({
      sort: (collector) => {
        return collector.node_id;
      },
    });
  },
  sortByOperatingSystem() {
    this.setState({
      sort: (collector) => {
        return collector.node_details.operating_system;
      },
    });
  },
  sortByLastSeen() {
    this.setState({
      sort: (collector) => {
        return collector.last_seen;
      },
    });
  },
  sortByCollectorVersion() {
    this.setState({
      sort: (collector) => {
        return collector.collector_version;
      },
    });
  },
  _formatEmptyListAlert() {
    const showInactiveHint = (this.state.showInactive ? null : ' and/or click on \"Include inactive collectors\"');
    return <Alert>There are no collectors to show. Try adjusting your search filter{showInactiveHint}.</Alert>;
  },
  _onSubmit(event) {
    event.preventDefault();
  },
  _onFilterChange(event) {
    this.setState({ filter: event.target.value });
  },
  render() {
    if (this.state.collectors) {
      const collectors = this._getFilteredCollectors()
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

            <form className="form-inline collectors-filter-form" onSubmit={this._onSubmit}>
              <div className="form-group form-group-sm">
                <label htmlFor="collectorsfilter" className="control-label">Filter collectors:</label>
                <input type="text" name="filter" id="collectorsfilter" className="form-control"
                       value={this.state.filter} onChange={this._onFilterChange} />
              </div>
            </form>

            {collectorList}
          </Col>
        </Row>
      );
    }

    return <Spinner />;
  },
});

export default CollectorList;
