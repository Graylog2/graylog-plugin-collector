import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

import OperatingSystemIcon from './OperatingSystemIcon';

const BackendIndicator = createReactClass({
  propTypes: {
    backend: PropTypes.string.isRequired,
    operatingSystem: PropTypes.string.isRequired,
  },

  render() {
    const { backend, operatingSystem } = this.props;
    return (
      <span>
        <OperatingSystemIcon operatingSystem={operatingSystem} /> {backend} on {operatingSystem}
      </span>
    );
  },
});

export default BackendIndicator;
