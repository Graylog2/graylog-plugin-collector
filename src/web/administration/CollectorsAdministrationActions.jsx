import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Button, ButtonToolbar } from 'react-bootstrap';

const CollectorsAdministrationActions = createReactClass({
  render() {
    return (
      <ButtonToolbar>
        <Button bsSize="small" bsStyle="link">Process <span className="caret" /></Button>
        <Button bsSize="small" bsStyle="link">Configure <span className="caret" /></Button>
      </ButtonToolbar>
    );
  },
});

export default CollectorsAdministrationActions;
