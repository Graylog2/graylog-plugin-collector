import PropTypes from 'prop-types';
import React from 'react';
import { Button, Label } from 'react-bootstrap';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

import Routes from 'routing/Routes';
import { Timestamp } from 'components/common';

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

  _getId(prefixIdName) {
    return prefixIdName + this.props.sidecar.node_id;
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

    glyphClass += ' sidecar-os';

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

  _tagsAsBadges(sidecar) {
    if (sidecar.node_details.tags) {
      return sidecar.node_details.tags.map((tag) =>
        <span className="badge configuration-tag configuration-tag-sm" key={this._getId(tag)}>{tag}</span>
      );
    } else {
      return;
    }
  },

  render() {
    const sidecar = this.props.sidecar;
    const sidecarClass = sidecar.active ? '' : 'greyed-out inactive';
    const style = {};
    const annotation = sidecar.active ? '' : '(inactive)';
    const osGlyph = this._getOsGlyph(sidecar.node_details.operating_system);
    let sidecarState = null;
    if (sidecar.node_details.status) {
      sidecarState = sidecar.node_details.status.status;
    }
    return (
      <tr className={sidecarClass} style={style}>
        <td className="sidecar-name">
          <Link to={Routes.pluginRoute('SYSTEM_SIDECARS_ID_STATUS')(sidecar.node_id)}>
            {sidecar.node_name}
          </Link>
          <p>
            {this._tagsAsBadges(sidecar)}
          </p>
        </td>
        <td>
          <Label bsStyle={this._labelClassForState(sidecarState)}
                 bsSize="xsmall">{this._textForState(sidecarState)}</Label>
        </td>
        <td>
          {osGlyph}
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
          {sidecar.sidecar_version}
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
