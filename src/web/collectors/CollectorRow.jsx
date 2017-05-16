import React from 'react';
import { Button, Label } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Routes from 'routing/Routes';
import { Timestamp } from 'components/common';

const CollectorRow = React.createClass({
  propTypes: {
    collector: React.PropTypes.object.isRequired,
  },
  getInitialState() {
    return {
      showRelativeTime: true,
    };
  },

  componentDidMount() {
    this.style.use();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!styles/CollectorStyles.css'),

  _getId(prefixIdName) {
    return prefixIdName + this.props.collector.id;
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

  _labelClassForState(state) {
    switch (state) {
      case 0:
        return 'success';
      case 1:
        return 'warning';
      case 2:
        return 'danger';
      default:
        return 'warning';
    }
  },

  _textForState(state) {
    switch (state) {
      case 0:
        return 'Running';
      case 1:
        return 'Unknown';
      case 2:
        return 'Failing';
      default:
        return 'Unknown';
    }
  },

  _tagsAsBadges(collector) {
    if (collector.node_details.tags) {
      return collector.node_details.tags.map((tag) =>
        <span className="badge configuration-tag configuration-tag-sm" key={this._getId(tag)}>{tag}</span>
      );
    } else {
      return;
    }
  },

  render() {
    const collector = this.props.collector;
    const collectorClass = collector.active ? '' : 'greyed-out inactive';
    const style = {};
    const annotation = collector.active ? '' : '(inactive)';
    const osGlyph = this._getOsGlyph(collector.node_details.operating_system);
    let collectorState = null;
    if (collector.node_details.status) {
      collectorState = collector.node_details.status.status;
    }
    return (
      <tr className={collectorClass} style={style}>
        <td className="collector-name">
          <LinkContainer to={Routes.pluginRoute('SYSTEM_COLLECTORS_ID_STATUS')(collector.id)}>
            <a>{collector.node_id}</a>
          </LinkContainer>
          <p>
            {this._tagsAsBadges(collector)}
          </p>
        </td>
        <td>
          <Label bsStyle={this._labelClassForState(collectorState)}
                 bsSize="xsmall">{this._textForState(collectorState)}</Label>
        </td>
        <td>
          {osGlyph}
          {collector.node_details.operating_system}
        </td>
        <td>
          <Timestamp dateTime={collector.last_seen} relative={this.state.showRelativeTime} />
        </td>
        <td>
          {collector.id}
          {annotation}
        </td>
        <td>
          {collector.collector_version}
        </td>
        <td>
          <LinkContainer to={Routes.search_with_query(`gl2_source_collector:${collector.id}`, 'relative', 604800)}>
            <Button bsSize="xsmall" bsStyle="info">Show messages</Button>
          </LinkContainer>
        </td>
      </tr>
    );
  },
});

export default CollectorRow;
