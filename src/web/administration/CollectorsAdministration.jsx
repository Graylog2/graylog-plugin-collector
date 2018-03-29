import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Col, Row } from 'react-bootstrap';

import { ControlledTableList, SearchForm } from 'components/common';
import { Input } from 'components/bootstrap';
import CollectorIndicator from 'sidecars/CollectorIndicator';
import CollectorAdministrationFilters from './CollectorsAdministrationFilters';
import CollectorAdministrationActions from './CollectorsAdministrationActions';

import SidecarsActions from '../sidecars/SidecarsActions';

import style from './CollectorsAdministration.css';

const CollectorsAdministration = createReactClass({
  propTypes: {
    sidecarCollectors: PropTypes.array.isRequired,
    collectors: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
  },

  getInitialState() {
    return {
      filteredCollectors: this.props.sidecarCollectors,
      selected: [],
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!lodash.isEqual(this.props.sidecarCollectors, nextProps.sidecarCollectors)) {
      this.setState({ filteredCollectors: nextProps.sidecarCollectors });
    }
  },

  componentDidUpdate() {
    this.setSelectAllCheckboxState(this.selectAllInput, this.props.sidecarCollectors, this.state.selected);
  },

  setSelectAllCheckboxState(selectAllInput, collectors, selected) {
    const selectAllCheckbox = selectAllInput ? selectAllInput.getInputDOMNode() : undefined;
    if (!selectAllCheckbox) {
      return;
    }
    // Set the select all checkbox as indeterminate if some but not items are selected.
    selectAllCheckbox.indeterminate = selected.length > 0 && !this.isAllSelected(collectors, selected);
  },

  sidecarCollectorId(sidecar, collector) {
    return `${sidecar.node_id}-${collector.name}`;
  },

  handleConfigurationChange(selectedConfiguration, doneCallback) {
    const { selected } = this.state;

    const selectedSidecars = this.props.sidecarCollectors
      .filter(({ collector }) => selectedConfiguration.backend_id === collector.id)
      .filter(({ sidecar, collector }) => selected.includes(this.sidecarCollectorId(sidecar, collector)))
      .map(({ sidecar }) => sidecar);

    SidecarsActions.assignConfigurations(selectedSidecars, selectedConfiguration).then(() => doneCallback());
  },

  formatHeader() {
    const { sidecarCollectors, collectors, configurations } = this.props;
    const { selected, filteredCollectors } = this.state;
    const selectedItems = this.state.selected.length;

    const selectedCollectors = selected.map((selectedCollectorBackendId) => {
      return {
        id: selectedCollectorBackendId,
        collector: filteredCollectors.find(({ sidecar, collector }) => this.sidecarCollectorId(sidecar, collector) === selectedCollectorBackendId),
      };
    });

    let headerMenu;
    if (selectedItems === 0) {
      headerMenu = (
        <CollectorAdministrationFilters collectors={collectors} configurations={configurations} filter={this.filterCollectors} />
      );
    } else {
      headerMenu = (
        <CollectorAdministrationActions selectedCollectors={selectedCollectors}
                                        collectors={collectors}
                                        configurations={configurations}
                                        onConfigurationSelectionChange={this.handleConfigurationChange} />
      );
    }

    return (
      <ControlledTableList.Header>
        <div className={style.headerComponentsWrapper}>{headerMenu}</div>

        <Input ref={(c) => { this.selectAllInput = c; }}
               id="select-all-checkbox"
               type="checkbox"
               label={selectedItems === 0 ? 'Select all' : `${selectedItems} selected`}
               disabled={sidecarCollectors.length === 0}
               checked={this.isAllSelected(sidecarCollectors, selected)}
               onChange={this.toggleSelectAll}
               wrapperClassName="form-group-inline" />
      </ControlledTableList.Header>
    );
  },

  handleSidecarCollectorSelect(sidecarCollectorId) {
    return (event) => {
      const newSelection = (event.target.checked ?
        lodash.union(this.state.selected, [sidecarCollectorId]) :
        lodash.without(this.state.selected, sidecarCollectorId));
      this.setState({ selected: newSelection });
    };
  },

  isAllSelected(collectors, selected) {
    return collectors.length > 0 && collectors.length === selected.length;
  },

  toggleSelectAll(event) {
    const newSelection = (event.target.checked ?
      this.props.sidecarCollectors.map(({ sidecar, collector }) => this.sidecarCollectorId(sidecar, collector)) :
      []);
    this.setState({ selected: newSelection });
  },

  formatSidecarCollector(sidecar, collector) {
    const sidecarCollectorId = this.sidecarCollectorId(sidecar, collector);
    return (
      <ControlledTableList.Item key={`sidecar-${sidecarCollectorId}`}>
        <div className={style.collectorEntry}>
          <Row>
            <Col md={6}>
              <Input id={`${sidecarCollectorId}-checkbox`}
                     type="checkbox"
                     label={sidecar.node_name}
                     checked={this.state.selected.includes(sidecarCollectorId)}
                     onChange={this.handleSidecarCollectorSelect(sidecarCollectorId)} />
              <span className={style.sidecarId}>{sidecar.node_id}</span>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div className={style.additionalInformation}>
                <em>
                  <CollectorIndicator collector={collector.name} operatingSystem={sidecar.node_details.operating_system} />
                </em>
              </div>
            </Col>
          </Row>
        </div>
      </ControlledTableList.Item>
    );
  },

  filterCollectors(predicate) {
    const filteredCollectors = this.props.sidecarCollectors.filter(predicate);
    this.setState({ filteredCollectors: filteredCollectors });
  },

  filterCollectorsByQuery(query) {
    const predicate = ({ sidecar }) => sidecar.node_name.match(query, 'i') || sidecar.node_id.match(query, 'i');
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
    const { sidecarCollectors } = this.props;
    const { filteredCollectors } = this.state;

    let formattedCollectors;
    if (filteredCollectors.length === 0) {
      formattedCollectors = (
        <ControlledTableList.Item>
          {sidecarCollectors.length === 0 ? 'There are no collectors to display' : 'Filters do not match any collectors'}
        </ControlledTableList.Item>
      );
    } else {
      formattedCollectors = [];
      filteredCollectors.forEach(({ sidecar, collector }) => {
        formattedCollectors.push(this.formatSidecarCollector(sidecar, collector));
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
