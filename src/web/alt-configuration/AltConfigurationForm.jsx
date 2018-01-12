import PropTypes from 'prop-types';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { SourceCodeEditor } from 'components/common';
import { Input } from 'components/bootstrap';
import history from 'util/History';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';
import SourceViewModal from './SourceViewModal';

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

  _onShowSource(id) {
    this._save();
    this.refs[`modal_${id}`].open();
  },

  render() {
    return (
      <div>
        <form onSubmit={this._onSubmit}>
          <fieldset>
            <Input type="text"
                   id={this._getId('name')}
                   label="Name"
                   onChange={this._onNameChange}
                   help="Configuration name."
                   value={this.state.formData.name} />


            <Input id="configuration-editor" label="Configuration" help="Collector configuration, see quick reference for more information.">
              <SourceCodeEditor id="configuration-text-editor"
                                value={this.state.formData.snippet}
                                onChange={this._onSourceChange} />
              <Button className="pull-right"
                      bsStyle="link"
                      bsSize="sm"
                      onClick={() => this._onShowSource(this.props.configuration.id)}>
                Save and preview
              </Button>
            </Input>
          </fieldset>

          <Row>
            <Col md={12}>
              <div className="form-group">
                <Button type="submit"
                        bsStyle="primary"
                        style={{ marginRight: 10 }}>
                  Save
                </Button>
                <Button type="button"
                        onClick={this._onCancel}>
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </form>
        <SourceViewModal ref={`modal_${this.props.configuration.id}`}
                         configurationId={this.props.configuration.id}
                         renderTemplate />
      </div>
    );
  },
});

export default AltConfigurationForm;

