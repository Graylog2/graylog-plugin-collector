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

  onCollectorSelect(collectorId) {
    return (event) => {
      const newSelected = event.target.checked ? lodash.union(this.state.selected, [collectorId]) : lodash.without(this.state.selected, collectorId);
      this.setState({ selected: newSelected });
    };
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
                     onChange={this.onCollectorSelect(collector.id)} />
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
          <ControlledTableList.Header>Collectors</ControlledTableList.Header>
          {formattedCollectors}
        </ControlledTableList>
      </div>
    );
  },
});

export default CollectorsAdministration;
