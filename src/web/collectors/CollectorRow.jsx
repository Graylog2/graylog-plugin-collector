import React from 'react';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import ApiRoutes from 'routing/ApiRoutes';
import { Timestamp } from 'components/common';
import {} from '!style!css!styles/CollectorStyles.css';

const CollectorRow = React.createClass({
  propTypes: {
    collector: React.PropTypes.object.isRequired,
  },
  getInitialState() {
    return {
      showRelativeTime: true,
    };
  },
  _getOsGlyph(operatingSystem) {
    let glyphClass = 'fa-question-circle';
    const os = operatingSystem.trim().toLowerCase();
    if (os.indexOf('darwin') !== -1 || os.indexOf('mac os') !== -1) {
      glyphClass = 'fa-apple';
    } else if (os.indexOf('linux') !== -1) {
      glyphClass = 'fa-linux';
    } else if (os.indexOf('win') !== -1) {
      glyphClass = 'fa-windows';
    }

    glyphClass += ' collector-os';

    return (<i className={`fa ${glyphClass}`} />);
  },
  render() {
    const collector = this.props.collector;
    const collectorClass = collector.active ? '' : 'greyed-out inactive';
    const style = {};
    const annotation = collector.active ? '' : '(inactive)';
    const osGlyph = this._getOsGlyph(collector.node_details.operating_system);
    return (
      <tr className={collectorClass} style={style}>
        <td className="limited">
          {collector.node_id}
        </td>
        <td className="limited">
          {osGlyph}
          {collector.node_details.operating_system}
        </td>
        <td className="limited">
          <Timestamp dateTime={collector.last_seen} relative={this.state.showRelativeTime} />
        </td>
        <td className="limited">
          {collector.id}
          {annotation}
        </td>
        <td className="limited">
          {collector.collector_version}
        </td>
        <td>
          <LinkContainer to={ApiRoutes.SearchController.index(`gl2_source_collector:${collector.id}`, 'relative', 28800).url}>
            <Button bsSize="xsmall" bsStyle="info">Show messages</Button>
          </LinkContainer>
        </td>
      </tr>
    );
  },
});

export default CollectorRow;
