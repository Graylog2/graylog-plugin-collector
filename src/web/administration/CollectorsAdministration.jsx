import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap';

import { ControlledTableList, SearchForm } from 'components/common';
import { Input } from 'components/bootstrap';
import BackendIndicator from 'collectors/BackendIndicator';

import style from './CollectorsAdministration.css';

const CollectorsAdministration = createReactClass({
  propTypes: {
    collectors: PropTypes.array.isRequired,
  },

  getInitialState() {
    return {
      query: '',
      filteredCollectors: this.props.collectors,
      selected: [],
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!lodash.isEqual(this.props.collectors, nextProps.collectors)) {
      this.filterCollectors(this.state.query, nextProps.collectors);
    }
  },

  componentDidUpdate() {
    this.setSelectAllCheckboxState(this.selectAllInput, this.props.collectors, this.state.selected);
  },

  setSelectAllCheckboxState(selectAllInput, collectors, selected) {
    const selectAllCheckbox = selectAllInput ? selectAllInput.getInputDOMNode() : undefined;
    if (!selectAllCheckbox) {
      return;
    }
    // Set the select all checkbox as indeterminate if some but not items are selected.
    selectAllCheckbox.indeterminate = selected.length > 0 && !this.isAllSelected(collectors, selected);
  },

  handleCollectorSelect(collectorId) {
    return (event) => {
      const newSelection = (event.target.checked ? lodash.union(this.state.selected, [collectorId]) : lodash.without(this.state.selected, collectorId));
      this.setState({ selected: newSelection });
    };
  },

  isAllSelected(collectors, selected) {
    return collectors.length > 0 && collectors.length === selected.length;
  },

  toggleSelectAll(event) {
    const newSelection = (event.target.checked ? this.props.collectors.map(collector => collector.id) : []);
    this.setState({ selected: newSelection });
  },

  getHeaderFilters() {
    return (
      <ButtonToolbar>
        <Button bsSize="small" bsStyle="link">Backend <span className="caret" /></Button>
        <Button bsSize="small" bsStyle="link">Configuration <span className="caret" /></Button>
        <Button bsSize="small" bsStyle="link">OS <span className="caret" /></Button>
        <Button bsSize="small" bsStyle="link">Status <span className="caret" /></Button>
      </ButtonToolbar>
    );
  },

  getBulkActions() {
    return (
      <ButtonToolbar>
        <Button bsSize="small" bsStyle="link">Process <span className="caret" /></Button>
        <Button bsSize="small" bsStyle="link">Configure <span className="caret" /></Button>
      </ButtonToolbar>
    );
  },

  formatHeader() {
    const { collectors } = this.props;
    const { selected } = this.state;
    const selectedItems = this.state.selected.length;

    return (
      <ControlledTableList.Header>
        <div className={style.headerComponentsWrapper}>
          {selectedItems === 0 ? this.getHeaderFilters() : this.getBulkActions()}
        </div>

        <Input ref={(c) => { this.selectAllInput = c; }}
               id="select-all-checkbox"
               type="checkbox"
               label={selectedItems === 0 ? 'Select all' : `${selectedItems} selected`}
               disabled={collectors.length === 0}
               checked={this.isAllSelected(collectors, selected)}
               onChange={this.toggleSelectAll}
               wrapperClassName="form-group-inline" />
      </ControlledTableList.Header>
    );
  },

  formatCollector(collector, backend) {
    return (
      <ControlledTableList.Item key={`collector-${collector.id}-${backend}`}>
        <div className={style.collectorEntry}>
          <Row>
            <Col md={6}>
              <Input id={`${collector.id}-checkbox`}
                     type="checkbox"
                     label={collector.node_id}
                     checked={this.state.selected.includes(collector.id)}
                     onChange={this.handleCollectorSelect(collector.id)} />
              <span className={style.collectorId}>{collector.id}</span>
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

  filterCollectors(query, collectors) {
    const filteredCollectors = collectors.filter(collector => collector.id.match(query) || collector.node_id.match(query));
    this.setState({ query: query, filteredCollectors: filteredCollectors });
  },

  handleSearch(query, callback) {
    this.filterCollectors(query, this.props.collectors);
    callback();
  },

  handleReset() {
    this.filterCollectors('', this.props.collectors);
  },

  render() {
    const { filteredCollectors } = this.state;

    let formattedCollectors;
    if (filteredCollectors.length === 0) {
      formattedCollectors = (
        <ControlledTableList.Item>No items to display</ControlledTableList.Item>
      );
    } else {
      formattedCollectors = [];
      filteredCollectors.forEach((collector) => {
        const backends = Object.keys(collector.node_details.status.backends);
        backends.forEach((backend) => {
          formattedCollectors.push(this.formatCollector(collector, backend));
        });
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
