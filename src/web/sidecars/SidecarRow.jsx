import PropTypes from 'prop-types';
import React from 'react';
import { Button, Label } from 'react-bootstrap';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

import Routes from 'routing/Routes';
import { Timestamp } from 'components/common';
import OperatingSystemIcon from './OperatingSystemIcon';

const SidecarRow = React.createClass({
  propTypes: {
    sidecar: PropTypes.object.isRequired,
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

  style: require('!style/useable!css!styles/SidecarStyles.css'),

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
    const sidecar = this.props.sidecar;
    const sidecarClass = sidecar.active ? '' : 'greyed-out inactive';
    const style = {};
    const annotation = sidecar.active ? '' : ' (inactive)';
    let sidecarState = null;
    if (sidecar.node_details.status) {
      sidecarState = sidecar.node_details.status.status;
    }
    return (
      <tr className={sidecarClass} style={style}>
        <td className="sidecar-name">
          {sidecar.active ?
            <Link to={Routes.pluginRoute('SYSTEM_SIDECARS_ID_STATUS')(sidecar.node_id)}>
              {sidecar.node_name}
            </Link> :
            sidecar.node_name
          }
        </td>
        <td>
          <Label bsStyle={this._labelClassForState(sidecarState)}
                 bsSize="xsmall">{this._textForState(sidecarState)}</Label>
        </td>
        <td>
          <OperatingSystemIcon operatingSystem={sidecar.node_details.operating_system} />&ensp;
          {sidecar.node_details.operating_system}
        </td>
        <td>
          <Timestamp dateTime={sidecar.last_seen} relative={this.state.showRelativeTime} />
        </td>
        <td>
          {sidecar.node_id}
          {annotation}
        </td>
        <td>
          {sidecar.collector_version}
        </td>
        <td>
          <LinkContainer to={Routes.search_with_query(`gl2_source_collector:${sidecar.node_id}`, 'relative', 604800)}>
            <Button bsSize="xsmall" bsStyle="info">Show messages</Button>
          </LinkContainer>
        </td>
      </tr>
    );
  },
});

export default SidecarRow;
