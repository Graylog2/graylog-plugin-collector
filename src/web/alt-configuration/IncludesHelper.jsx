import React from 'react';
import { Button, Table } from 'react-bootstrap';

import { Spinner } from 'components/common';

import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';

import SourceViewModal from './SourceViewModal';

const IncludesHelper = React.createClass({
  getInitialState() {
    return {
      configurations: [],
    };
  },

  componentDidMount() {
    this._reloadConfiguration();
  },

  _reloadConfiguration() {
    CollectorConfigurationsActions.list.triggerPromise()
      .then((configurations) => {
        this.setState({ configurations: configurations });
      });
  },

  _getId(idName, index) {
    const idIndex = index !== undefined ? `. ${index}` : '';
    return idName + idIndex;
  },

  _onShowSource(id) {
    this.refs[`modal_${id}`].open();
  },

  _configurationListFormatter() {
    const configurationRows = [];
    Object.values(this.state.configurations).forEach((configuration) => {
      const escapedName = `{{${configuration.name}}}`;
      configurationRows.push(
        <tr key={this._getId(configuration.id)}>
          <td><code>.{escapedName}</code></td>
          <td>{configuration.id}</td>
          <td>
            <Button bsStyle="link"
                    bsSize="sm"
                    title="Show source"
                    onClick={() => this._onShowSource(configuration.id)}>
              <i className="fa fa-envelope-open-o" />
            </Button>
            <SourceViewModal ref={`modal_${configuration.id}`} configurationId={configuration.id} />
          </td>
        </tr>,
      );
    });
    return configurationRows;
  },

  _isLoading() {
    return this.state.configurations.length === 0;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    return (
      <div>
        <h3>Configurations</h3>
        <Table responsive>
          <thead>
            <tr>
              <th>Include Statement</th>
              <th>Id</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this._configurationListFormatter()}
          </tbody>
        </Table>
      </div>
    );
  },
});
export default IncludesHelper;
