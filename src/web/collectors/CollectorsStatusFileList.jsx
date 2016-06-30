import React from 'react';

import { DataTable, Timestamp } from 'components/common';

const CollectorsStatusFileList = React.createClass({
  propTypes: {
    files: React.PropTypes.array.isRequired,
  },

  getInitialState() {
    return {files: this.props.files};
  },

  _headerCellFormatter(header) {
    return <th>{header}</th>;
  },

  _fileListFormatter(file) {
    return (
      <tr key={file.path}>
        <td className="limited"><Timestamp dateTime={file.mod_time} format="YYYY-MM-DD HH:mm:ss"/></td>
        <td className="limited">{file.size}</td>
        <td>{file.path}</td>
      </tr>
    );
  },

  render() {
    var filterKeys = [];
    var headers = ["Modified", "Size", "Path"];

    return (
      <div>
        <DataTable id="log-file-list"
                   className="table-hover"
                   headers={headers}
                   headerCellFormatter={this._headerCellFormatter}
                   rows={this.state.files}
                   dataRowFormatter={this._fileListFormatter}
                   filterLabel="Filter Files"
                   filterKeys={filterKeys}>
        </DataTable>
      </div>
    );
  }
});

export default CollectorsStatusFileList;
