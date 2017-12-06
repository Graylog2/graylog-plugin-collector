import PropTypes from 'prop-types';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import AceEditor from 'react-ace';

import { Input } from 'components/bootstrap';

const AltConfigurationForm = React.createClass({
  propTypes: {
    configuration: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      editor: undefined,
      parseErrors: [],
    };
  },

  _getId(prefixIdName) {
    return this.state.name !== undefined ? prefixIdName + this.state.name : prefixIdName;
  },

  render() {
    return (
      <form onSubmit={this._onSubmit}>
        <fieldset>
          <Input type="text"
                 id={this._getId('name')}
                 label="Name"
                 onChange={this._onNameChange}
                 help="Configuration name."
                 value={this.props.configuration.name} />


          <Input id="configuration-editor" label="Configuration" help="Collector configuration, see quick reference for more information.">
            <div style={{ border: '1px solid lightgray', borderRadius: 5 }}>
              <AceEditor
                mode="text"
                theme="chrome"
                name="edit"
                fontSize={13}
                height="18em"
                width="100%"
                editorProps={{ $blockScrolling: 'Infinity' }}
                value=""
                focus
                onLoad={this._onLoad}
                onChange={this._onSourceChange}
              />
            </div>
          </Input>
        </fieldset>

        <Row>
          <Col md={12}>
            <div className="form-group">
              <Button type="submit" bsStyle="primary" style={{ marginRight: 10 }}>Save</Button>
              <Button type="button" onClick={this._onBack}>Cancel</Button>
            </div>
          </Col>
        </Row>
      </form>
    );
  },
});

export default AltConfigurationForm;

