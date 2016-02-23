import React from 'react';
import Reflux from 'reflux';
import { Button, Input, Col, Row } from 'react-bootstrap';

import {DataTable, PageHeader, Spinner} from 'components/common';
import RoleList from 'components/users/RoleList';

import EditInputModal from './EditInputModal';
import EditOutputModal from './EditOutputModal';
import EditSnippetModal from './EditSnippetModal';
import DeleteInputButton from './DeleteInputButton'
import DeleteOutputButton from './DeleteOutputButton'
import DeleteSnippetButton from './DeleteSnippetButton'
import CollectorsActions from './CollectorsActions';
import CollectorsStore from './CollectorsStore';
import CollectorConfigurationsActions from './CollectorConfigurationsActions';
import TagsSelect from './TagsSelect';

const CollectorConfiguration = React.createClass({
    getInitialState() {
        return {
            inputs: undefined,
            outputs: undefined,
            snippets: undefined,
            tags: undefined,
            availableTags: undefined,
        };
    },

    componentDidMount() {
        this._reloadConfiguration();
        this._loadTags();
    },

    _reloadConfiguration(){
        CollectorConfigurationsActions.getConfiguration.triggerPromise(this.props.params.id).then(this._setConfiguration);
    },

    _setConfiguration(configuration) {
        this.setState({inputs: configuration.inputs,
                        outputs: configuration.outputs,
                        snippets: configuration.snippets,
                        tags: configuration.tags});
    },

    _loadTags() {
        CollectorConfigurationsActions.listTags.triggerPromise()
            .then((tags) => {
                this.setState({availableTags: tags})
            });
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

    _inputFormatter(input) {
        return (
            <tr key={input.input_id}>
                <td>{input.name}</td>
                <td>{input.type}</td>
                <td>{input.properties.Module || "none"}</td>
                <td>{input.forward_to}</td>
                <td style={{width: 130}}><EditInputModal id={input.input_id} name={input.name}
                                                        properties={input.properties} create={false}
                                                        reload={this._reloadConfiguration} saveInput={this._saveInput}
                                                        validInputName={this._validInputName}/>
                                        <DeleteInputButton input={input} onClick={this._deleteInput}/></td>
            </tr>
        );
    },

    _outputFormatter(output) {
        return (
            <tr key={output.input_id}>
                <td>{output.name}</td>
                <td>{output.type}</td>
                <td>{output.properties.Module || "none"}</td>
                <td style={{width: 140}}><EditOutputModal id={output.output_id} name={output.name} backend={output.backend}
                                                          type={output.type} properties={output.properties} create={false}
                                                          reload={this._reloadConfiguration} saveOutput={this._saveOutput}
                                                          validOutputName={this._validOutputName}/>
                                        <DeleteOutputButton output={output} onClick={this._deleteOutput}/></td>
            </tr>
        );
    },

    _snippetFormatter(snippet) {
        return (
            <tr key={snippet.snippet_id}>
                <td>{snippet.name}</td>
                <td>{snippet.type}</td>
                <td style={{width: 150}}><EditSnippetModal id={snippet.snippet_id} name={snippet.name} snippet={snippet.snippet}
                                                           create={false} reload={this._reloadConfiguration}
                                                           saveSnippet={this._saveSnippet} validSnippetName={this._validSnippetName}/>
                    <DeleteSnippetButton snippet={snippet} onClick={this._deleteSnippet}/></td>
            </tr>
        );
    },

    _saveOutput(output, callback) {
        CollectorConfigurationsActions.saveOutput.triggerPromise(output, this.props.params.id)
            .then(() => {
                callback();
                this._reloadConfiguration();
            });
    },

    _saveInput(input, callback) {
        CollectorConfigurationsActions.saveInput.triggerPromise(input, this.props.params.id)
            .then(() => {
                callback();
                this._reloadConfiguration();

            });
    },

    _saveSnippet(snippet, callback) {
        CollectorConfigurationsActions.saveSnippet.triggerPromise(snippet, this.props.params.id)
            .then(() => {
                callback();
                this._reloadConfiguration();
            });
    },

    _deleteOutput(output) {
        CollectorConfigurationsActions.deleteOutput.triggerPromise(output, this.props.params.id)
            .then(() => {
                this._reloadConfiguration();
            });
    },

    _deleteInput(input) {
        CollectorConfigurationsActions.deleteInput.triggerPromise(input, this.props.params.id)
            .then(() => {
                this._reloadConfiguration();
            });
    },

    _deleteSnippet(snippet) {
        CollectorConfigurationsActions.deleteSnippet.triggerPromise(snippet, this.props.params.id)
            .then(() => {
                this._reloadConfiguration();
            });
    },

    _validInputName(name) {
        // Check if inputs already contain an input with the given name.
        return !this.state.inputs.some((input) => input.name === name);
    },

    _validOutputName(name) {
        // Check if outputs already contain an output with the given name.
        return !this.state.outputs.some((output) => output.name === name);
    },

    _validSnippetName(name) {
        // Check if snippets already contain an snippet with the given name.
        return !this.state.snippets.some((snippet) => snippet.name === name);
    },

    _updateTags(event) {
        event.preventDefault();
        const tags = this.refs.tags.getValue().filter((value) => value !== "");
        CollectorConfigurationsActions.updateTags(tags, this.props.params.id)
            .then(() => {
                this._reloadConfiguration();
            });
    },

    _isLoading() {
        return !(this.state.inputs  && this.state.outputs && this.state.snippets && this.state.availableTags);
    },

    render() {
        if (this._isLoading()) {
            return <Spinner/>;
        }

        const inputHeaders = ['Input', 'Type', 'Module', 'Forward To', 'Actions'];
        const outputHeaders = ['Output', 'Type', 'Module', 'Actions'];
        const snippetHeaders = ['Name', 'Type', 'Actions'];
        const filterKeys = [];
        const availableTags = this.state.availableTags.map((tag) => {return {name: tag}});
        const tagHelp = (
            <span className="help-block">
                Assign the relevant tags to this configuration to make them available to the collectors with the same tag.<br />
            </span>
        );

        return(
            <div>
                <PageHeader title="Collector Configuration" titleSize={8} buttonSize={4} buttonStyle={{textAlign: 'right', marginTop: '10px'}}>
                    <span>
                        This is a list of inputs and outputs configured for the current collector.
                    </span>
                    {null}
                </PageHeader>
                <Row className="content">
                    <Col md={4}>
                        <h2>Change tags</h2>
                        <form className="form-horizontal" style={{marginTop: '10px'}} onSubmit={this._updateTags}>
                            <Input label="Tags" help={tagHelp}
                                   labelClassName="col-sm-2" wrapperClassName="col-sm-10">
                                <TagsSelect ref="tags" availableTags={availableTags} tags={this.state.tags} className="form-control"/>
                            </Input>
                            <div className="form-group">
                                <Col smOffset={2}>
                                    <Button bsStyle="success" type="submit">
                                        Update tags
                                    </Button>
                                </Col>
                            </div>
                        </form>
                    </Col>
                </Row>
                <Row className="content">
                    <Col md={12}>
                        <h2>Configure Outputs</h2>
                        <div className="pull-right">
                            <EditOutputModal id={""} name={""} properties={{}} create
                                            reload={this._reloadConfiguration}
                                            saveOutput={this._saveOutput}
                                            validOutputName={this._validOutputName}/>
                        </div>
                        <DataTable id="collector-outputs-list"
                                   className="table-striped table-hover"
                                   headers={outputHeaders}
                                   headerCellFormatter={this._headerCellFormatter}
                                   sortByKey={"type"}
                                   rows={this.state.outputs}
                                   dataRowFormatter={this._outputFormatter}
                                   filterLabel="Filter outputs"
                                   filterKeys={filterKeys}/>
                    </Col>
                </Row>
                <Row className="content">
                    <Col md={12}>
                        <h2>Configure Inputs</h2>
                        <div className="pull-right">
                            <EditInputModal id={""} name={""} properties={{}} outputs={this.state.outputs} create
                                            reload={this._reloadConfiguration}
                                            saveInput={this._saveInput}
                                            validInputName={this._validInputName}/>
                        </div>
                        <DataTable id="collector-inputs-list"
                                   className="table-striped table-hover"
                                   headers={inputHeaders}
                                   headerCellFormatter={this._headerCellFormatter}
                                   sortByKey={"type"}
                                   rows={this.state.inputs}
                                   dataRowFormatter={this._inputFormatter}
                                   filterLabel="Filter inputs"
                                   filterKeys={filterKeys}/>
                    </Col>
                </Row>
                <Row className="content">
                    <Col md={12}>
                        <h2>Define Snippets</h2>
                        <div className="pull-right">
                            <EditSnippetModal id={""} name={""} create
                                            reload={this._reloadConfiguration}
                                            saveSnippet={this._saveSnippet}
                                            validSnippetName={this._validSnippetName}/>
                        </div>
                        <DataTable id="collector-snippets-list"
                                   className="table-striped table-hover"
                                   headers={snippetHeaders}
                                   headerCellFormatter={this._headerCellFormatter}
                                   sortByKey={"type"}
                                   rows={this.state.snippets}
                                   dataRowFormatter={this._snippetFormatter}
                                   filterLabel="Filter snippets"
                                   filterKeys={filterKeys}/>
                    </Col>
                </Row>

            </div>
        )
    },
});

export default CollectorConfiguration;