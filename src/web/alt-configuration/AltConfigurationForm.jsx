import PropTypes from 'prop-types';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import AceEditor from 'react-ace';

import { Input } from 'components/bootstrap';
import history from 'util/History';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';

const AltConfigurationForm = React.createClass({
  propTypes: {
    configuration: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      editor: undefined,
      parseErrors: [],
      formData: {
        id: this.props.configuration.snippets[0].snippet_id,
        name: this.props.configuration.snippets[0].name,
        snippet: String(this.props.configuration.snippets[0].snippet),
        backend: this.props.configuration.snippets[0].backend,
      },
    };
  },

  _getId(prefixIdName) {
    return this.state.name !== undefined ? prefixIdName + this.state.name : prefixIdName;
  },

  _save() {
    if (this.state.parseErrors.length === 0) {
      CollectorConfigurationsActions.saveSnippet.triggerPromise(this.state.formData, this.props.configuration.id);
    }
  },

  _onNameChange(event) {
    const formData = this.state.formData;
    formData.name = event.target.value;
    this.setState({ formData });
  },

  _onSourceChange(value) {
    const formData = this.state.formData;
    formData.snippet = value;
    this.setState({ formData });
  },

  _onSubmit(event) {
    event.preventDefault();
    this._save();
  },

  _onCancel() {
    history.goBack();
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
                 value={this.state.formData.name} />


          <Input id="configuration-editor" label="Configuration" help="Collector configuration, see quick reference for more information.">
            <div style={{ border: '1px solid lightgray', borderRadius: 5 }}>
              <AceEditor
                mode="text"
                theme="chrome"
                name="edit"
                fontSize={14}
                height="22em"
                width="100%"
                editorProps={{ $blockScrolling: 'Infinity' }}
                value={this.state.formData.snippet}
                onChange={this._onSourceChange}
                focus
              />
            </div>
          </Input>
        </fieldset>

        <Row>
          <Col md={12}>
            <div className="form-group">
              <Button type="submit" bsStyle="primary" style={{ marginRight: 10 }}>Save</Button>
              <Button type="button" onClick={this._onCancel}>Cancel</Button>
            </div>
          </Col>
        </Row>
      </form>
    );
  },
});

export default AltConfigurationForm;

