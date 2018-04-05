import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Button, Col, ControlLabel, FormGroup, HelpBlock, Row } from 'react-bootstrap';

import { Select, SourceCodeEditor } from 'components/common';
import { Input } from 'components/bootstrap';
import history from 'util/History';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';
import SourceViewModal from './SourceViewModal';
import CollectorsStore from '../configurations/CollectorsStore';

const AltConfigurationForm = React.createClass({
  mixins: [Reflux.connect(CollectorsStore)],
  propTypes: {
    configuration: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      editor: undefined,
      parseErrors: [],
      formData: {
        id: this.props.configuration.id,
        name: this.props.configuration.name,
        backend_id: this.props.configuration.backend_id,
        template: String(this.props.configuration.template),
      },
    };
  },

  componentDidMount() {
    CollectorsStore.list();
  },

  _save() {
    if (this.state.parseErrors.length === 0) {
      CollectorConfigurationsActions.updateConfiguration.triggerPromise(this.state.formData);
    }
  },

  _onNameChange(event) {
    // TODO: validate if name is unique
    const formData = this.state.formData;
    formData.name = event.target.value;
    this.setState({ formData });
  },

  _changeCollectorDropdown(id) {
    const formData = this.state.formData;
    formData.backend_id = id;
    this.setState(formData);
  },

  _onSourceChange(value) {
    const formData = this.state.formData;
    formData.template = value;
    this.setState({ formData });
  },

  _onSubmit(event) {
    event.preventDefault();
    this._save();
  },

  _onCancel() {
    history.goBack();
  },

  _onShowSource() {
    this.modal.open();
  },

  _formatCollectorOptions() {
    const options = [];

    if (this.state.collectors) {
      this.state.collectors.forEach((collector) => {
        options.push({ value: collector.id, label: collector.name });
      });
    } else {
      options.push({ value: 'none', label: 'Loading collector list...', disable: true });
    }

    return options;
  },

  render() {
    return (
      <div>
        <form onSubmit={this._onSubmit}>
          <fieldset>
            <Input type="text"
                   id="name"
                   label="Name"
                   onChange={this._onNameChange}
                   help="Configuration name."
                   value={this.state.formData.name}
                   autoFocus
                   required />

            <FormGroup controlId="backend_id">
              <ControlLabel>Collector</ControlLabel>
              <Select inputProps={{ id: 'backend_id' }}
                      options={this._formatCollectorOptions()}
                      value={this.state.formData.backend_id}
                      onChange={this._changeCollectorDropdown}
                      placeholder="Collector"
                      required />
              <HelpBlock>Choose the log collector this configuration is meant for.</HelpBlock>
            </FormGroup>

            <FormGroup controlId="template">
              <ControlLabel>Configuration</ControlLabel>
              <SourceCodeEditor id="template"
                                value={this.state.formData.template}
                                onChange={this._onSourceChange} />
              <Button className="pull-right"
                      bsStyle="link"
                      bsSize="sm"
                      onClick={this._onShowSource}>
                Preview
              </Button>
              <HelpBlock>Collector configuration, see quick reference for more information.</HelpBlock>
            </FormGroup>
          </fieldset>

          <Row>
            <Col md={12}>
              <div className="form-group">
                <Button type="submit"
                        bsStyle="primary"
                        style={{ marginRight: 10 }}>
                  Save
                </Button>
                <Button type="button" onClick={this._onCancel}>
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </form>
        <SourceViewModal ref={(c) => { this.modal = c; }}
                         configurationId={this.props.configuration.id}
                         preview />
      </div>
    );
  },
});

export default AltConfigurationForm;

