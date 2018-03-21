import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Col, Row } from 'react-bootstrap';

import { ControlledTableList, SearchForm } from 'components/common';
import { Input } from 'components/bootstrap';
import BackendIndicator from 'collectors/BackendIndicator';
import CollectorAdministrationFilters from './CollectorsAdministrationFilters';
import CollectorAdministrationActions from './CollectorsAdministrationActions';

import style from './CollectorsAdministration.css';

const CollectorsAdministration = createReactClass({
  propTypes: {
    collectorsByBackend: PropTypes.array.isRequired,
    backends: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
  },

  getInitialState() {
    return {
      filteredCollectors: this.props.collectorsByBackend,
      selected: [],
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!lodash.isEqual(this.props.collectorsByBackend, nextProps.collectorsByBackend)) {
      this.setState({ filteredCollectors: nextProps.collectorsByBackend });
    }
  },

  componentDidUpdate() {
    this.setSelectAllCheckboxState(this.selectAllInput, this.props.collectorsByBackend, this.state.selected);
  },

  setSelectAllCheckboxState(selectAllInput, collectors, selected) {
    const selectAllCheckbox = selectAllInput ? selectAllInput.getInputDOMNode() : undefined;
    if (!selectAllCheckbox) {
      return;
    }
    // Set the select all checkbox as indeterminate if some but not items are selected.
    selectAllCheckbox.indeterminate = selected.length > 0 && !this.isAllSelected(collectors, selected);
  },

  collectorBackendId(collector, backend) {
    return `${collector.node_id}-${backend}`;
  },

  formatHeader() {
    const { collectorsByBackend, backends, configurations } = this.props;
    const { selected } = this.state;
    const selectedItems = this.state.selected.length;

    return (
      <ControlledTableList.Header>
        <div className={style.headerComponentsWrapper}>
          {selectedItems === 0 ?
            <CollectorAdministrationFilters backends={backends} configurations={configurations} filter={this.filterCollectors} /> :
            <CollectorAdministrationActions backends={backends} configurations={configurations} />}
        </div>

        <Input ref={(c) => { this.selectAllInput = c; }}
               id="select-all-checkbox"
               type="checkbox"
               label={selectedItems === 0 ? 'Select all' : `${selectedItems} selected`}
               disabled={collectorsByBackend.length === 0}
               checked={this.isAllSelected(collectorsByBackend, selected)}
               onChange={this.toggleSelectAll}
               wrapperClassName="form-group-inline" />
      </ControlledTableList.Header>
    );
  },

  handleCollectorBackendSelect(collectorBackendId) {
    return (event) => {
      const newSelection = (event.target.checked ?
        lodash.union(this.state.selected, [collectorBackendId]) :
        lodash.without(this.state.selected, collectorBackendId));
      this.setState({ selected: newSelection });
    };
  },

  isAllSelected(collectors, selected) {
    return collectors.length > 0 && collectors.length === selected.length;
  },

  toggleSelectAll(event) {
    const newSelection = (event.target.checked ?
      this.props.collectorsByBackend.map(({ collector, backend }) => this.collectorBackendId(collector, backend)) :
      []);
    this.setState({ selected: newSelection });
  },

  formatCollectorBackend(collector, backend) {
    const collectorBackendId = this.collectorBackendId(collector, backend);
    return (
      <ControlledTableList.Item key={`collector-${collectorBackendId}`}>
        <div className={style.collectorEntry}>
          <Row>
            <Col md={6}>
              <Input id={`${collectorBackendId}-checkbox`}
                     type="checkbox"
                     label={collector.node_name}
                     checked={this.state.selected.includes(collectorBackendId)}
                     onChange={this.handleCollectorBackendSelect(collectorBackendId)} />
              <span className={style.collectorId}>{collector.node_id}</span>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div className={style.additionalInformation}>
                <em>
                  <BackendIndicator backend={backend} operatingSystem={collector.node_details.operating_system} />
                </em>
              </div>
            </Col>
          </Row>
        </div>
      </ControlledTableList.Item>
    );
  },

  filterCollectors(predicate) {
    const filteredCollectors = this.props.collectorsByBackend.filter(predicate);
    this.setState({ filteredCollectors: filteredCollectors });
  },

  filterCollectorsByQuery(query) {
    const predicate = ({ collector }) => collector.node_name.match(query, 'i') || collector.node_id.match(query, 'i');
    this.filterCollectors(predicate);
  },

  handleSearch(query, callback) {
    this.filterCollectorsByQuery(query);
    callback();
  },

  handleReset() {
    this.filterCollectorsByQuery('');
  },

  render() {
    const { collectorsByBackend } = this.props;
    const { filteredCollectors } = this.state;

    let formattedCollectors;
    if (filteredCollectors.length === 0) {
      formattedCollectors = (
        <ControlledTableList.Item>
          {collectorsByBackend.length === 0 ? 'There are no collectors to display' : 'Filters do not match any collectors'}
        </ControlledTableList.Item>
      );
    } else {
      formattedCollectors = [];
      filteredCollectors.forEach(({ backend, collector }) => {
        formattedCollectors.push(this.formatCollectorBackend(collector, backend));
      });
    }

    return (
      <div>
        <Row>
          <Col md={12}>
            <SearchForm onSearch={this.handleSearch}
                        onReset={this.handleReset}
                        searchButtonLabel="Filter"
                        resetButtonLabel="Reset"
                        label="Filter collectors"
                        useLoadingState />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <ControlledTableList>
              {this.formatHeader()}
              {formattedCollectors}
            </ControlledTableList>
          </Col>
        </Row>
      </div>
    );
  },
});

export default CollectorsAdministration;
