import React from 'react';
import { Button, Col, Row, Tabs, Tab } from 'react-bootstrap';
import naturalSort from 'javascript-natural-sort';

import { Input } from 'components/bootstrap';
import { DataTable } from 'components/common';

import CopyOutputModal from './CopyOutputModal';
import CopyInputModal from './CopyInputModal';
import CopySnippetModal from './CopySnippetModal';
import EditInputModal from './EditInputModal';
import EditOutputModal from './EditOutputModal';
import EditSnippetModal from './EditSnippetModal';
import DeleteConfirmButton from './DeleteConfirmButton';
import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';
import TagsSelect from './TagsSelect';

const CollectorConfiguration = React.createClass({
  propTypes: {
    configuration: React.PropTypes.object.isRequired,
    tags: React.PropTypes.array.isRequired,
    onConfigurationChange: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    const outputs = {};
    let initialTab = 'beat';
    outputs.beat = this.props.configuration.outputs.filter(key => key.backend === 'filebeat' || key.backend === 'winlogbeat').length;
    outputs.nxlog = this.props.configuration.outputs.filter(key => key.backend === 'nxlog').length;

    if (outputs.beat === 0) {
      const tab = Object.keys(outputs).reduce((a, b) => {
        return outputs[a] > outputs[b] ? a : b;
      });
      if (outputs[tab] > 0) {
        initialTab = tab;
      }
    }
    return { tab: initialTab };
  },

  _headerCellFormatter(header) {
    let className;

    switch (header.toLowerCase()) {
      case 'name':
      case 'input':
      case 'output':
        className = 'name';
        break;
      case 'type':
        className = 'type';
        break;
      case 'forward_to':
        className = 'forwardTo';
        break;
      case 'actions':
        className = 'actions';
        break;
      default:
        // Do nothing
    }

    return <th className={className}>{header}</th>;
  },

  _outputFormatter(output) {
    return (
      <tr key={output.output_id}>
        <td>{output.name}</td>
        <td>{output.backend}</td>
        <td>{output.output_id}</td>
        <td>
          <DeleteConfirmButton entity={output} type="output" onClick={this._deleteOutput} />
          &nbsp;
          <CopyOutputModal id={output.output_id} validOutputName={this._validOutputName} copyOutput={this._copyOutput} />
          &nbsp;
          <EditOutputModal id={output.output_id} name={output.name}
                           backend={output.backend}
                           type={output.type} properties={output.properties}
                           create={false} selectedGroup={this.state.tab}
                           saveOutput={this._saveOutput}
                           validOutputName={this._validOutputName}
                           outputList={this._filteredOutputs()} />
        </td>
      </tr>
    );
  },

  _inputFormatter(input) {
    var filterOutputs = this.props.configuration.outputs.filter(this._filterConfigurations);
    return (
      <tr key={input.input_id}>
        <td>{input.name}</td>
        <td>{input.type}</td>
        <td>{this._getOutputById(input.forward_to).name}</td>
        <td>{input.input_id}</td>
        <td>
          <DeleteConfirmButton entity={input} type="input" onClick={this._deleteInput} />
          &nbsp;
          <CopyInputModal id={input.input_id} validInputName={this._validInputName} copyInput={this._copyInput} />
          &nbsp;
          <EditInputModal id={input.input_id} name={input.name} forwardTo={input.forward_to}
                          backend={input.backend} type={input.type}
                          properties={input.properties} outputs={filterOutputs}
                          create={false} selectedGroup={this.state.tab}
                          saveInput={this._saveInput} validInputName={this._validInputName} />
        </td>
      </tr>
    );
  },

  _snippetFormatter(snippet) {
    return (
      <tr key={snippet.snippet_id}>
        <td>{snippet.name}</td>
        <td>{snippet.backend}</td>
        <td>
          <DeleteConfirmButton entity={snippet} type="snippet" onClick={this._deleteSnippet} />
          &nbsp;
          <CopySnippetModal id={snippet.snippet_id} validSnippetName={this._validSnippetName} copySnippet={this._copySnippet} />
          &nbsp;
          <EditSnippetModal id={snippet.snippet_id} name={snippet.name} snippet={snippet.snippet}
                            backend={snippet.backend} create={false} selectedGroup={this.state.tab}
                            saveSnippet={this._saveSnippet} validSnippetName={this._validSnippetName} />
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

  _copyOutput(outputId, name, callback) {
    CollectorConfigurationsActions.copyOutput.triggerPromise(outputId, name, this.props.configuration.id)
        .then(() => this._onSuccessfulUpdate(callback));
  },

  _copyInput(inputId, name, callback) {
    CollectorConfigurationsActions.copyInput.triggerPromise(inputId, name, this.props.configuration.id)
        .then(() => this._onSuccessfulUpdate(callback));
  },

  _copySnippet(snippetId, name, callback) {
    CollectorConfigurationsActions.copySnippet.triggerPromise(snippetId, name, this.props.configuration.id)
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

  _tabSwitched(tabKey) {
    this.setState({tab: tabKey});
  },

  _tabDisplayName() {
    switch(this.state.tab) {
      case 'nxlog':
        return "NXLog";
        break;
      case 'beat':
        return "Beats";
        break;
      default:
        return "Collector";
    }
  },

  _filterConfigurations(element) {
    if (this.state.tab == "nxlog" && element.backend == "nxlog") {
      return true;
    }
    if (this.state.tab == "beat" && element.backend.indexOf("beat") != -1) {
      return true;
    }
    return false;
  },

  _filteredOutputs() {
    let filebeatOutputs = 0;
    let winlogbeatOutputs = 0;
    const outputs = [
      { group: 'nxlog', value: 'nxlog:gelf-udp', label: '[NXLog] GELF UDP output' },
      { group: 'nxlog', value: 'nxlog:gelf-tcp', label: '[NXLog] GELF TCP output' },
      { group: 'nxlog', value: 'nxlog:gelf-tcp-tls', label: '[NXLog] GELF TCP/TLS output' },
      { group: 'beat', value: 'filebeat:logstash', label: '[FileBeat] Beats output' },
      { group: 'beat', value: 'winlogbeat:logstash', label: '[WinLogBeat] Beats output' },
    ];

    this.props.configuration.outputs.forEach(item => {
      switch (item.backend) {
        case 'filebeat':
          filebeatOutputs++;
          break;
        case 'winlogbeat':
          winlogbeatOutputs++;
          break;
        default:
      }
    });

    outputs.forEach((item, index) => {
      switch (item.value.split(':', 1)[0]) {
        case 'filebeat':
          if (filebeatOutputs >= 1) {
            outputs[index].disabled = true;
          }
          break;
        case 'winlogbeat':
          if (winlogbeatOutputs >= 1) {
            outputs[index].disabled = true;
          }
          break;
        default:
      }
    });
    return outputs;
  },

  render() {
    const outputHeaders = ['Output', 'Type', 'Id', 'Actions'];
    const inputHeaders = ['Input', 'Type', 'Forward To', 'Id', 'Actions'];
    const snippetHeaders = ['Name', 'Backend', 'Actions'];
    const filterKeys = [];
    const availableTags = this.props.tags.map((tag) => {
      return { name: tag };
    });
    var filterOutputs = this.props.configuration.outputs.filter(this._filterConfigurations);
    var filterInputs = this.props.configuration.inputs.filter(this._filterConfigurations);
    var filterSnippets = this.props.configuration.snippets.filter(this._filterConfigurations);

    return (
      <div>
        <Row className="content">
          <Col md={8}>
            <h2>Configuration tags</h2>
            <p>Manage tags for this configuration. Collectors using one of these tags will automatically apply this configuration.</p>
            <form className="form-horizontal" style={{ marginTop: 15 }} onSubmit={this._updateTags}>
              <Input label="Tags"
                     help="Select a tag or create new ones by typing their name."
                     labelClassName="col-sm-2" wrapperClassName="col-sm-10">
                <Row>
                  <Col md={7}>
                    <TagsSelect ref="tags" availableTags={availableTags} tags={this.props.configuration.tags}
                                className="form-control" />
                  </Col>
                  <Col md={5} style={{ paddingLeft: 0 }}>
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
            <Tabs id="collectorBackendSelector"
                  activeKey={this.state.tab}
                  animation={false}
                  onSelect={this._tabSwitched}>
              <Tab eventKey="beat" title="Beats"/>
              <Tab eventKey="nxlog" title="NXLog"/>
            </Tabs>

            <Row>
                <Col md={12}>
                    <div style={{marginTop: 10}}>
                      <div className="pull-right">
                        <EditOutputModal create
                                         saveOutput={this._saveOutput}
                                         validOutputName={this._validOutputName}
                                         selectedGroup={this.state.tab}
                                         outputList={this._filteredOutputs()}/>
                      </div>

                      <h2>Configure {this._tabDisplayName()} Outputs</h2>
                      <p>Manage log destinations for collectors using this configuration.</p>
                      <DataTable id="collector-outputs-list"
                                 className="table-striped table-hover"
                                 headers={outputHeaders}
                                 headerCellFormatter={this._headerCellFormatter}
                                 sortByKey={"type"}
                                 rows={filterOutputs.sort((o1, o2) => naturalSort(o1.name, o2.name))}
                                 noDataText="There are not any configured outputs."
                                 dataRowFormatter={this._outputFormatter}
                                 filterLabel="Filter outputs"
                                 filterKeys={filterKeys}/>
                    </div>
                </Col>
              </Row>
              <hr/>

              <Row>
                <Col md={12}>
                  <div className="pull-right">
                    <EditInputModal outputs={filterOutputs} create
                                    saveInput={this._saveInput}
                                    validInputName={this._validInputName}
                                    selectedGroup={this.state.tab}/>
                  </div>
                  <h2>Configure {this._tabDisplayName()} Inputs</h2>
                  <p>Manage log sources for collectors using this configuration.</p>
                  <DataTable id="collector-inputs-list"
                             className="table-striped table-hover"
                             headers={inputHeaders}
                             headerCellFormatter={this._headerCellFormatter}
                             sortByKey={"type"}
                             rows={filterInputs.sort((i1, i2) => naturalSort(i1.name, i2.name))}
                             noDataText="There are not any configured inputs."
                             dataRowFormatter={this._inputFormatter}
                             filterLabel="Filter inputs"
                             filterKeys={filterKeys}/>
                </Col>
              </Row>
              <hr/>

              <Row>
                <Col md={12}>
                  <div className="pull-right">
                    <EditSnippetModal create
                                      saveSnippet={this._saveSnippet}
                                      validSnippetName={this._validSnippetName}
                                      selectedGroup={this.state.tab}/>
                  </div>
                  <h2>Define {this._tabDisplayName()} Snippets</h2>
                  <p>Define your own configuration snippets to take advantage of advanced configuration.</p>
                  <DataTable id="collector-snippets-list"
                             className="table-striped table-hover"
                             headers={snippetHeaders}
                             headerCellFormatter={this._headerCellFormatter}
                             sortByKey={"backend"}
                             rows={filterSnippets.sort((s1, s2) => naturalSort(s1.name, s2.name))}
                             noDataText="There are not any defined snippets."
                             dataRowFormatter={this._snippetFormatter}
                             filterLabel="Filter snippets"
                             filterKeys={filterKeys}/>
                </Col>
              </Row>
          </Col>
        </Row>
      </div>
    );
  },
});

export default CollectorConfiguration;
