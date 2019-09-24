import PropTypes from 'prop-types';
import React from 'react';

import { Alert, Collapse } from 'components/graylog';
import { Input } from 'components/bootstrap';

class CollapsibleVerbatim extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    let expanded = false;
    if (props.value) {
      expanded = true;
    }

    this.state = {
      expanded: expanded,
    };
  }

  _onHandleToggle = (e) => {
    e.preventDefault();
    this.setState({ expanded: !this.state.expanded });
  };

  _getId = (prefixIdName) => {
    return prefixIdName + this.props.type;
  };

  render() {
    const text = this.state.expanded ? 'Hide' : 'Add';

    return (
      <span className="verbatim-configuration">
        <a href="#" onClick={this._onHandleToggle}>{text} verbatim configuration</a>
        <Collapse in={this.state.expanded} timeout={0}>
          <Alert ref="well">
            <Input type="textarea"
                   id={this._getId('verbatim')}
                   label="Add verbatim configuration"
                   value={this.props.value}
                   onChange={this.props.onChange('verbatim')} />
          </Alert>
        </Collapse>
      </span>
    );
  }
}

export default CollapsibleVerbatim;
