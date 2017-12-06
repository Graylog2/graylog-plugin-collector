import PropTypes from 'prop-types';
import React from 'react';
import { Col, MenuItem, Nav, Navbar, NavDropdown, Panel, Row } from 'react-bootstrap';

import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';

import ConfigurationHelperStyle from './ConfigurationHelper.css';

const ConfigurationHelper = React.createClass({
  propTypes: {
    type: PropTypes.string.isRequired,
  },

  configurationExample: `<Input in>
    Module	im_tcp
    Host	0.0.0.0
    Port	1514
</Input>`,

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
          This module accepts TCP connections on the address and port specified in the configuration. It can handle
          multiple simultaneous connections. The TCP transfer protocol provides more reliable log transmission than UDP.
          If security is a concern, consider using the im_ssl module instead.
          <pre className={`${ConfigurationHelperStyle.marginTab} ${ConfigurationHelperStyle.exampleFunction}`}>
            {this.configurationExample}
          </pre>
        </Panel>
      </Panel>
    );
  },
});

export default ConfigurationHelper;
