import PropTypes from 'prop-types';
import React from 'react';
import { Col, MenuItem, Nav, Navbar, NavDropdown, Panel, Row } from 'react-bootstrap';

import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';

import FilebeatHelper from './FilebeatHelper';
import ConfigurationHelperStyle from './ConfigurationHelper.css';

const ConfigurationHelper = React.createClass({
  propTypes: {
    type: PropTypes.string.isRequired,
  },

  render() {
    return (
      <Panel header="Filebeat quick reference">
        <Row className="row-sm">
          <Col md={12}>
            <p className={ConfigurationHelperStyle.marginQuickReferenceText}>
              Read the <DocumentationLink page={DocsHelper.PAGES.PIPELINE_RULES}
                                          text="full documentation" />{' '}
              to gain a better understanding of how the Filebeat collector work.
            </p>
          </Col>
        </Row>

        <Navbar collapseOnSelect>
          <Navbar.Collapse>
            <Nav>
              <NavDropdown eventKey={1} title="Inputs" id="basic-nav-dropdown">
                <MenuItem eventKey={1.1}>File</MenuItem>
                <MenuItem eventKey={1.2}>Syslog</MenuItem>
                <MenuItem eventKey={1.3}>Windows Event</MenuItem>
              </NavDropdown>
              <NavDropdown eventKey={2} title="Outputs" id="basic-nav-dropdown">
                <MenuItem eventKey={2.1}>GELF</MenuItem>
                <MenuItem eventKey={2.2}>TCP</MenuItem>
                <MenuItem eventKey={2.3}>TCP/SSL</MenuItem>
              </NavDropdown>
              <NavDropdown eventKey={3} title="Filters" id="basic-nav-dropdown">
                <MenuItem eventKey={3.1}>RegEx</MenuItem>
                <MenuItem eventKey={3.2}>Pattern Matcher</MenuItem>
                <MenuItem eventKey={3.3}>Event Correlator</MenuItem>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Panel>
          <FilebeatHelper section={'prospector'} paragraph={'log'} />
        </Panel>
      </Panel>
    );
  },
});

export default ConfigurationHelper;
