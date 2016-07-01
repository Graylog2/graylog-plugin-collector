import React from 'react';
import { Button, Label } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import ApiRoutes from 'routing/ApiRoutes';
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

        return (<i className={`fa ${glyphClass}`}/>);
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

    render() {
    const collector = this.props.collector;
    const collectorClass = collector.active ? '' : 'greyed-out inactive';
    const style = {};
    const annotation = collector.active ? '' : '(inactive)';
    const osGlyph = this._getOsGlyph(collector.node_details.operating_system);
    var collectorState = null;
    if (collector.node_details.status) {
        collectorState = collector.node_details.status.status;
    };
    return (
      <tr className={collectorClass} style={style}>
        <td className="limited">
          <LinkContainer to={`/system/collectors/${collector.id}/status`}>
           <a>{collector.node_id}</a>
          </LinkContainer>
        </td>
        <td className="limited">
          <Label bsStyle={this._labelClassForState(collectorState)} bsSize="xsmall">{this._textForState(collectorState)}</Label>
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
