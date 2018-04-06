import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'react-bootstrap';

class ColorLabel extends React.Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
  };

  render() {
    // eslint-disable-next-line react/self-closing-comp
    return <Label style={{ backgroundColor: this.props.color, border: '1px solid #ccc' }}>&emsp;</Label>;
  }
}

export default ColorLabel;
