import React from 'react';
import Reflux from 'reflux';
import { Button, Row, Col, Alert } from 'react-bootstrap';

import {Spinner} from 'components/common';

import CollectorConfigurationsStore from './CollectorConfigurationsStore';
import ConfigurationRow from './ConfigurationRow';
import CollectorConfigurationsActions from './CollectorConfigurationsActions';

const ConfigurationsList = React.createClass({
    mixins: [Reflux.connect(CollectorConfigurationsStore)],

    getInitialState() {
        return {
            filter: '',
            sort: undefined,
        };
    },

    componentDidMount() {
        this._reloadConfiguration();
    },

    _reloadConfiguration(){
        CollectorConfigurationsActions.list();
    },

    _formatEmptyListAlert() {
        return <Alert>There are no configurations to show.</Alert>;
    },

    _getFilteredConfigurations() {
        const filter = this.state.filter.toLowerCase().trim();
        return this.state.configurations.filter((configuration) => { return !filter || configuration._id.toLowerCase().indexOf(filter) !== -1; });
    },

    _formatConfigurationList(configurations) {
        return (
            <div className="table-responsive">
                <table className="table table-striped collectors-list">
                    <thead>
                    <tr>
                        <th onClick={this.sortByConfigurationId}>Configuration</th>
                        <th onClick={this.sortByTags}>Tags</th>
                        <th style={{width: 85}}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {configurations}
                    </tbody>
                </table>
            </div>
        );
    },

    _onDelete(configuration) {
        CollectorConfigurationsActions.delete.triggerPromise(configuration)
            .then(() => {
                this._reloadConfiguration();
            });
    },

    _isLoading() {
        return !(this.state.configurations);
    },

    render() {
        if (this._isLoading()) {
            return <Spinner/>;
        }

        if (this.state.configurations) {
            const configurations = this._getFilteredConfigurations()
                .sort(this._bySortField)
                .map((configuration) => {
                        return <ConfigurationRow key={configuration._id} configuration={configuration} onDelete={this._onDelete}/>;
                    }
                );

            const configurationList = (configurations.length > 0 ? this._formatConfigurationList(configurations) : this._formatEmptyListAlert());

            return (
                    <div>
                        <form className="form-inline configurations-filter-form" onSubmit={(evt) => evt.preventDefault() }>
                            <div className="form-group form-group-sm">
                                <label htmlFor="configurationsfilter" className="control-label">Filter configurations:</label>
                                <input type="text" name="filter" id="configurationsfilter" className="form-control" value={this.state.filter} onChange={(event) => {this.setState({filter: event.target.value});}} />
                            </div>
                        </form>
                        {configurationList}
                    </div>
            );
        }
    },
});

export default ConfigurationsList;
