import React from 'react';
import Reflux from 'reflux';
import { Button, Input, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

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

    _outputFormatter(output) {
        return (
            <tr key={output.input_id}>
                <td>{output.name}</td>
                <td>{output.type}</td>
                <td style={{width: 155}}>
                    <EditOutputModal id={output.output_id} name={output.name}
                                     backend={output.backend}
                                     type={output.type} properties={output.properties}
                                     create={false}
                                     reload={this._reloadConfiguration}
                                     saveOutput={this._saveOutput}
                                     validOutputName={this._validOutputName}/>
                    &nbsp;
                    <DeleteOutputButton output={output} onClick={this._deleteOutput}/>
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
                <td style={{width: 155}}>
                    <EditInputModal id={input.input_id} name={input.name} forwardTo={input.forward_to}
                                    backend={input.backend} type={input.type}
                                    properties={input.properties} outputs={this.state.outputs}
                                    create={false} reload={this._reloadConfiguration}
                                    saveInput={this._saveInput} validInputName={this._validInputName}/>
                    &nbsp;
                    <DeleteInputButton input={input} onClick={this._deleteInput}/>
                </td>
            </tr>
        );
    },

    _snippetFormatter(snippet) {
        return (
            <tr key={snippet.snippet_id}>
                <td>{snippet.name}</td>
                <td>{snippet.backend}</td>
                <td style={{width: 155}}>
                    <EditSnippetModal id={snippet.snippet_id} name={snippet.name} snippet={snippet.snippet}
                                      backend={snippet.backend} create={false} reload={this._reloadConfiguration}
                                      saveSnippet={this._saveSnippet} validSnippetName={this._validSnippetName}/>
                    &nbsp;
                    <DeleteSnippetButton snippet={snippet} onClick={this._deleteSnippet}/>
                </td>
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

    _getOutputById(id) {
        return this.state.outputs.find((output) => output.output_id === id);
    },

    _isLoading() {
        return !(this.state.inputs  && this.state.outputs && this.state.snippets && this.state.availableTags);
    },

    render() {
        if (this._isLoading()) {
            return <Spinner/>;
        }

        const outputHeaders = ['Output', 'Type', 'Actions'];
        const inputHeaders = ['Input', 'Type', 'Forward To', 'Actions'];
        const snippetHeaders = ['Name', 'Backend', 'Actions'];
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
                    <span>
                        <LinkContainer to={'/system/collectors/configurations'}>
                            <a className="btn btn-info">Manage Configurations</a>
                        </LinkContainer>
                    </span>
                </PageHeader>
                <Row className="content">
                    <Col md={8}>
                        <h2>Change tags</h2>
                        <form className="form-horizontal" style={{marginTop: '10px'}} onSubmit={this._updateTags}>
                            <Input label="Tags" help={tagHelp}
                                   labelClassName="col-sm-2" wrapperClassName="col-sm-10">
                                <Row>
                                    <Col md={6}>
                                        <TagsSelect ref="tags" availableTags={availableTags} tags={this.state.tags} className="form-control"/>
                                    </Col>
                                    <Col md={6} style={{paddingLeft: 0}}>
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
                                   sortByKey={"backend"}
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
