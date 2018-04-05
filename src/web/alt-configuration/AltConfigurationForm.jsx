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

  _getId(prefixIdName) {
    return this.state.name !== undefined ? prefixIdName + this.state.name : prefixIdName;
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

  _onShowSource(id) {
    this.refs[`modal_${id}`].open();
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
                   id={this._getId('name')}
                   label="Name"
                   onChange={this._onNameChange}
                   help="Configuration name."
                   value={this.state.formData.name}
                   autoFocus
                   required />

            <FormGroup controlId={this._getId('log-collector')}>
              <ControlLabel>Collector</ControlLabel>
              <Select options={this._formatCollectorOptions()}
                      value={this.state.formData.backend_id}
                      onChange={this._changeCollectorDropdown}
                      placeholder="Collector"
                      required />
              <HelpBlock>Choose the log collector this configuration is meant for.</HelpBlock>
            </FormGroup>

            <Input id="configuration-editor" label="Configuration" help="Collector configuration, see quick reference for more information.">
              <SourceCodeEditor id="configuration-text-editor"
                                value={this.state.formData.template}
                                onChange={this._onSourceChange} />
              <Button className="pull-right"
                      bsStyle="link"
                      bsSize="sm"
                      onClick={() => this._onShowSource(this.props.configuration.id)}>
                Preview
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
                         preview />
      </div>
    );
  },
});

export default AltConfigurationForm;

