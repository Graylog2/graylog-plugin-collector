import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Col, Row } from 'react-bootstrap';

import { ControlledTableList, PaginatedList, SearchForm } from 'components/common';
import { Input } from 'components/bootstrap';
import CollectorIndicator from 'sidecars/CollectorIndicator';
import CollectorAdministrationFilters from './CollectorsAdministrationFilters';
import CollectorAdministrationActions from './CollectorsAdministrationActions';

import SidecarsActions from '../sidecars/SidecarsActions';

import style from './CollectorsAdministration.css';
import ColorLabel from '../common/ColorLabel';

const CollectorsAdministration = createReactClass({
  propTypes: {
    sidecarCollectors: PropTypes.array.isRequired,
    collectors: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    onPageChange: PropTypes.func.isRequired,
  },

  getInitialState() {
    const { sidecarCollectors } = this.props;
    return {
      enabledCollectors: this.getEnabledCollectors(sidecarCollectors),
      selected: [],
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!lodash.isEqual(this.props.sidecarCollectors, nextProps.sidecarCollectors)) {
      this.setState({
        enabledCollectors: this.getEnabledCollectors(nextProps.sidecarCollectors),
      });
    }
  },

  componentDidUpdate() {
    this.setSelectAllCheckboxState(this.selectAllInput, this.state.enabledCollectors, this.state.selected);
  },

  // Filter out sidecars with no compatible collectors
  getEnabledCollectors(collectors) {
    return collectors.filter(({ collector }) => !lodash.isEmpty(collector));
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

  handleConfigurationChange(selectedConfigurations, doneCallback) {
    const { selected, enabledCollectors } = this.state;

    const selectedSidecars = enabledCollectors
      .filter(({ sidecar, collector }) => selected.includes(this.sidecarCollectorId(sidecar, collector)));

    SidecarsActions.assignConfigurations(selectedSidecars, selectedConfigurations).then(() => doneCallback());
  },

  formatHeader() {
    const { collectors, configurations, sidecarCollectors } = this.props;
    const { selected, enabledCollectors } = this.state;
    const selectedItems = this.state.selected.length;

    const selectedCollectors = selected.map((selectedSidecarCollectorId) => {
      return {
        id: selectedSidecarCollectorId,
        collector: sidecarCollectors.find(({ sidecar, collector }) => this.sidecarCollectorId(sidecar, collector) === selectedSidecarCollectorId),
      };
    });

    let headerMenu;
    if (selectedItems === 0) {
      headerMenu = (
        <CollectorAdministrationFilters collectors={collectors} configurations={configurations} filter={() => {}} />
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
               disabled={enabledCollectors.length === 0}
               checked={this.isAllSelected(enabledCollectors, selected)}
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
      this.state.enabledCollectors.map(({ sidecar, collector }) => this.sidecarCollectorId(sidecar, collector)) :
      []);
    this.setState({ selected: newSelection });
  },

  formatCollectorState(state) {
    let text;
    let icon;
    let className;
    switch (state) {
      case 0:
        text = 'Running';
        className = 'text-success';
        icon = 'fa-play';
        break;
      case 2:
        text = 'Failing';
        className = 'text-danger';
        icon = 'fa-exclamation-triangle';
        break;
      default:
        text = 'Unknown';
        className = 'text-info';
        icon = 'fa-question-circle';
    }

    return (
      <span className={`${style.additionalInformation} ${className}`}><i className={`fa ${icon}`} /> {text}</span>
    );
  },

  formatSidecarNoCollectors(sidecar) {
    return (
      <ControlledTableList.Item key={`sidecar-${sidecar.node_id}`}>
        <div className={`${style.collectorEntry} ${style.disabledCollector}`}>
          <Row>
            <Col md={4}>
              <Input id={`${sidecar.node_id}-checkbox`}
                     type="checkbox"
                     label={sidecar.node_name}
                     checked={false}
                     disabled />
              <span className={style.sidecarId}>{sidecar.node_id}</span>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <span className={style.additionalInformation}>
                No collectors compatible with {sidecar.node_details.operating_system}
              </span>
            </Col>
          </Row>
        </div>
      </ControlledTableList.Item>
    );
  },

  formatSidecarCollector(sidecar, collector, configurations) {
    if (lodash.isEmpty(collector)) {
      return this.formatSidecarNoCollectors(sidecar);
    }

    const sidecarCollectorId = this.sidecarCollectorId(sidecar, collector);
    const configAssignment = sidecar.assignments.find(assignment => assignment.backend_id === collector.id) || {};
    const configuration = configurations.find(config => config.id === configAssignment.configuration_id);
    const backendStatus = (sidecar.node_details.status.backends[collector.name] || {}).status;

    return (
      <ControlledTableList.Item key={`sidecar-${sidecarCollectorId}`}>
        <div className={style.collectorEntry}>
          <Row>
            <Col md={4}>
              <Input id={`${sidecarCollectorId}-checkbox`}
                     type="checkbox"
                     label={sidecar.node_name}
                     checked={this.state.selected.includes(sidecarCollectorId)}
                     onChange={this.handleSidecarCollectorSelect(sidecarCollectorId)} />
              <span className={style.sidecarId}>{sidecar.node_id}</span>
            </Col>
            <Col md={3}>
              <div className={style.configurationLabel}>
                {configuration && <ColorLabel color={configuration.color} text={configuration.name} />}
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <span className={style.additionalInformation}>
                <em>
                  <CollectorIndicator collector={collector.name} operatingSystem={sidecar.node_details.operating_system} />
                </em>
              </span>
              {configuration && this.formatCollectorState(backendStatus)}
            </Col>
          </Row>
        </div>
      </ControlledTableList.Item>
    );
  },

  handleSearch(query, callback) {
    callback();
  },

  handleReset() {
  },

  render() {
    const { configurations, pagination, sidecarCollectors } = this.props;

    let formattedCollectors;
    if (sidecarCollectors.length === 0) {
      formattedCollectors = (
        <ControlledTableList.Item>
          {sidecarCollectors.length === 0 ? 'There are no collectors to display' : 'Filters do not match any collectors'}
        </ControlledTableList.Item>
      );
    } else {
      formattedCollectors = [];
      sidecarCollectors.forEach(({ sidecar, collector }) => {
        formattedCollectors.push(this.formatSidecarCollector(sidecar, collector, configurations));
      });
    }

    return (
      <div className={style.paginatedList}>
        <PaginatedList activePage={pagination.page}
                       pageSize={pagination.pageSize}
                       pageSizes={[1, 10, 25, 50, 100]}
                       totalItems={pagination.total}
                       onChange={this.props.onPageChange}>
          <SearchForm onSearch={this.handleSearch}
                      onReset={this.handleReset}
                      searchButtonLabel="Filter"
                      resetButtonLabel="Reset"
                      label="Filter collectors"
                      useLoadingState />
          <Row>
            <Col md={12}>
              <ControlledTableList>
                {this.formatHeader()}
                {formattedCollectors}
              </ControlledTableList>
            </Col>
          </Row>
        </PaginatedList>
      </div>
    );
  },
});

export default CollectorsAdministration;
