import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Button, ButtonToolbar } from 'react-bootstrap';

import CollectorConfigurationSelector from './CollectorConfigurationSelector';

const CollectorsAdministrationActions = createReactClass({
  propTypes: {
    collectors: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
    onConfigurationSelectionChange: PropTypes.func.isRequired,
  },

  render() {
    const { collectors, configurations, onConfigurationSelectionChange } = this.props;
    return (
      <ButtonToolbar>
        <Button bsSize="small" bsStyle="link">Process <span className="caret" /></Button>
        <CollectorConfigurationSelector collectors={collectors}
                                        configurations={configurations}
                                        onConfigurationSelectionChange={onConfigurationSelectionChange} />
      </ButtonToolbar>
    );
  },
});

export default CollectorsAdministrationActions;
