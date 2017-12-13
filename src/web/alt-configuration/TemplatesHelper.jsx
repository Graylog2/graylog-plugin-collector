import React from 'react';
import { Table } from 'react-bootstrap';

const TemplatesHelper = React.createClass({
  render() {
    return (
      <div>
        <h3>Variables</h3>
        <h5 style={{ marginBottom: 10 }}>Operating System</h5>
        <Table responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>.Linux</code></td>
              <td>True if executed on a Linux node.</td>
            </tr>
            <tr>
              <td><code>.Windows</code></td>
              <td>Same for Windows nodes.</td>
            </tr>
            <tr>
              <td><code>.LinuxPlatform</code></td>
              <td>Returns the base distribution as string, e.g. <code>&quot;debian&quot;, &quot;redhat&quot;</code></td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  },
});
export default TemplatesHelper;
