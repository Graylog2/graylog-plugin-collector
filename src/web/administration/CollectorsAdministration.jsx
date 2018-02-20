import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import { Col, Row } from 'react-bootstrap';

import { ControlledTableList } from 'components/common';
import { Input } from 'components/bootstrap';

import style from './CollectorsAdministration.css';

const CollectorsAdministration = createReactClass({
  propTypes: {
    collectors: PropTypes.array.isRequired,
  },

  getInitialState() {
    return {
      selected: [],
    };
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

  formatHeader() {
    const { collectors } = this.props;
    const { selected } = this.state;
    const selectedItems = this.state.selected.length;

    return (
      <ControlledTableList.Header>
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

  formatCollector(collector) {
    return (
      <ControlledTableList.Item key={`collector-${collector.id}`}>
        <Row className="row-sm">
          <Col md={6}>
            <div className={style.collectorRow}>
              <Input id={`${collector.id}-checkbox`}
                     type="checkbox"
                     label={collector.node_id}
                     checked={this.state.selected.includes(collector.id)}
                     onChange={this.handleCollectorSelect(collector.id)} />
              <span className={style.collectorId}>{collector.id}</span>
            </div>
          </Col>
        </Row>
      </ControlledTableList.Item>
    );
  },

  render() {
    const { collectors } = this.props;

    let formattedCollectors;
    if (collectors.length === 0) {
      formattedCollectors = (
        <ControlledTableList.Item>No items to display</ControlledTableList.Item>
      );
    } else {
      formattedCollectors = collectors.map(collector => this.formatCollector(collector));
    }

    return (
      <div>
        <ControlledTableList>
          {this.formatHeader()}
          {formattedCollectors}
        </ControlledTableList>
      </div>
    );
  },
});

export default CollectorsAdministration;
