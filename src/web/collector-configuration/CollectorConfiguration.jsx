import React from 'react';
import { Button, Input, Col, Row } from 'react-bootstrap';

import { DataTable } from 'components/common';

import EditInputModal from './EditInputModal';
import EditOutputModal from './EditOutputModal';
import EditSnippetModal from './EditSnippetModal';
import DeleteInputButton from './DeleteInputButton';
import DeleteOutputButton from './DeleteOutputButton';
import DeleteSnippetButton from './DeleteSnippetButton';
import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';
import TagsSelect from './TagsSelect';

const CollectorConfiguration = React.createClass({
  propTypes: {
    configuration: React.PropTypes.object.isRequired,
    tags: React.PropTypes.array.isRequired,
    onConfigurationChange: React.PropTypes.func.isRequired,
  },

  _headerCellFormatter(header) {
    let formattedHeaderCell;

    switch (header.toLocaleLowerCase()) {
      case 'name':
        formattedHeaderCell = <th className="name">{header}</th>;
        break;
      case 'type':
        formattedHeaderCell = <th className="type">{header}</th>;
        break;
      case 'forward_to':
        formattedHeaderCell = <th className="forwardTo">{header}</th>;
        break;
      default:
        formattedHeaderCell = <th>{header}</th>;
    }

    return formattedHeaderCell;
  },

  _outputFormatter(output) {
    return (
      <tr key={output.output_id}>
        <td>{output.name}</td>
        <td>{output.type}</td>
        <td style={{ width: 155 }}>
          <EditOutputModal id={output.output_id} name={output.name}
                           backend={output.backend}
                           type={output.type} properties={output.properties}
                           create={false}
                           saveOutput={this._saveOutput}
                           validOutputName={this._validOutputName} />
          &nbsp;
          <DeleteOutputButton output={output} onClick={this._deleteOutput} />
        </td>
      </tr>
    );
  },

  _inputFormatter(input) {
    return (
      <tr key={input.input_id}>
        <td>{input.name}</td>
        <td>{input.type}</td>
        <td>{this._getOutputById(input.forward_to).name}</td>
        <td style={{ width: 155 }}>
          <EditInputModal id={input.input_id} name={input.name} forwardTo={input.forward_to}
                          backend={input.backend} type={input.type}
                          properties={input.properties} outputs={this.props.configuration.outputs}
                          create={false}
                          saveInput={this._saveInput} validInputName={this._validInputName} />
          &nbsp;
          <DeleteInputButton input={input} onClick={this._deleteInput} />
        </td>
      </tr>
    );
  },

  _snippetFormatter(snippet) {
    return (
      <tr key={snippet.snippet_id}>
        <td>{snippet.name}</td>
        <td>{snippet.backend}</td>
        <td style={{ width: 155 }}>
          <EditSnippetModal id={snippet.snippet_id} name={snippet.name} snippet={snippet.snippet}
                            backend={snippet.backend} create={false}
                            saveSnippet={this._saveSnippet} validSnippetName={this._validSnippetName} />
          &nbsp;
          <DeleteSnippetButton snippet={snippet} onClick={this._deleteSnippet} />
        </td>
      </tr>
    );
  },

  _onSuccessfulUpdate(callback) {
    if (typeof callback === 'function') {
      callback();
    }
    this.props.onConfigurationChange();
  },

  _saveOutput(output, callback) {
    CollectorConfigurationsActions.saveOutput.triggerPromise(output, this.props.configuration.id)
      .then(() => this._onSuccessfulUpdate(callback));
  },

  _saveInput(input, callback) {
    CollectorConfigurationsActions.saveInput.triggerPromise(input, this.props.configuration.id)
      .then(() => this._onSuccessfulUpdate(callback));
  },

  _saveSnippet(snippet, callback) {
    CollectorConfigurationsActions.saveSnippet.triggerPromise(snippet, this.props.configuration.id)
      .then(() => this._onSuccessfulUpdate(callback));
  },

  _deleteOutput(output) {
    CollectorConfigurationsActions.deleteOutput.triggerPromise(output, this.props.configuration.id)
      .then(() => this._onSuccessfulUpdate());
  },

  _deleteInput(input) {
    CollectorConfigurationsActions.deleteInput.triggerPromise(input, this.props.configuration.id)
      .then(() => this._onSuccessfulUpdate());
  },

  _deleteSnippet(snippet) {
    CollectorConfigurationsActions.deleteSnippet.triggerPromise(snippet, this.props.configuration.id)
      .then(() => this._onSuccessfulUpdate());
  },

  _validInputName(name) {
    // Check if inputs already contain an input with the given name.
    return !this.props.configuration.inputs.some((input) => input.name === name);
  },

  _validOutputName(name) {
    // Check if outputs already contain an output with the given name.
    return !this.props.configuration.outputs.some((output) => output.name === name);
  },

  _validSnippetName(name) {
    // Check if snippets already contain an snippet with the given name.
    return !this.props.configuration.snippets.some((snippet) => snippet.name === name);
  },

  _updateTags(event) {
    event.preventDefault();
    const tags = this.refs.tags.getValue().filter((value) => value !== '');
    CollectorConfigurationsActions.updateTags(tags, this.props.configuration.id)
      .then(() => this._onSuccessfulUpdate());
  },

  _getOutputById(id) {
    return this.props.configuration.outputs.find((output) => output.output_id === id);
  },

  render() {
    const outputHeaders = ['Output', 'Type', 'Actions'];
    const inputHeaders = ['Input', 'Type', 'Forward To', 'Actions'];
    const snippetHeaders = ['Name', 'Backend', 'Actions'];
    const filterKeys = [];
    const availableTags = this.props.tags.map((tag) => {
      return { name: tag };
    });
    const tagHelp = (
      <span className="help-block">
        Assign the relevant tags to this configuration to make them available to the collectors with the same tag.<br />
      </span>
    );

    return (
      <div>
        <Row className="content">
          <Col md={8}>
            <h2>Change tags</h2>
            <form className="form-horizontal" style={{ marginTop: 10 }} onSubmit={this._updateTags}>
              <Input label="Tags" help={tagHelp}
                     labelClassName="col-sm-2" wrapperClassName="col-sm-10">
                <Row>
                  <Col md={6}>
                    <TagsSelect ref="tags" availableTags={availableTags} tags={this.props.configuration.tags}
                                className="form-control" />
                  </Col>
                  <Col md={6} style={{ paddingLeft: 0 }}>
                    <Button bsStyle="success" type="submit">
                      Update tags
                    </Button>
                  </Col>
                </Row>
              </Input>
            </form>
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <div className="pull-right">
              <EditOutputModal id={""} name={""} properties={{}} create
                               saveOutput={this._saveOutput}
                               validOutputName={this._validOutputName} />
            </div>
            <h2>Configure Outputs</h2>
            <DataTable id="collector-outputs-list"
                       className="table-striped table-hover"
                       headers={outputHeaders}
                       headerCellFormatter={this._headerCellFormatter}
                       sortByKey={"type"}
                       rows={this.props.configuration.outputs}
                       noDataText="There are not any configured outputs."
                       dataRowFormatter={this._outputFormatter}
                       filterLabel="Filter outputs"
                       filterKeys={filterKeys} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <div className="pull-right">
              <EditInputModal id={""} name={""} properties={{}} outputs={this.props.configuration.outputs} create
                              saveInput={this._saveInput}
                              validInputName={this._validInputName} />
            </div>
            <h2>Configure Inputs</h2>
            <DataTable id="collector-inputs-list"
                       className="table-striped table-hover"
                       headers={inputHeaders}
                       headerCellFormatter={this._headerCellFormatter}
                       sortByKey={"type"}
                       rows={this.props.configuration.inputs}
                       noDataText="There are not any configured inputs."
                       dataRowFormatter={this._inputFormatter}
                       filterLabel="Filter inputs"
                       filterKeys={filterKeys} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <div className="pull-right">
              <EditSnippetModal id={""} name={""} create
                                saveSnippet={this._saveSnippet}
                                validSnippetName={this._validSnippetName} />
            </div>
            <h2>Define Snippets</h2>
            <DataTable id="collector-snippets-list"
                       className="table-striped table-hover"
                       headers={snippetHeaders}
                       headerCellFormatter={this._headerCellFormatter}
                       sortByKey={"backend"}
                       rows={this.props.configuration.snippets}
                       noDataText="There are not any defined snippets."
                       dataRowFormatter={this._snippetFormatter}
                       filterLabel="Filter snippets"
                       filterKeys={filterKeys} />
          </Col>
        </Row>

      </div>
    );
  },
});

export default CollectorConfiguration;