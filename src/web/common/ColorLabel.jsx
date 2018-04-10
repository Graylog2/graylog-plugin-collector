import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'react-bootstrap';
import d3 from 'd3';

class ColorLabel extends React.Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  };

  static defaultProps = {
    // eslint-disable-next-line react/self-closing-comp
    text: <span>&emsp;</span>,
  };

  render() {
    const backgroundColor = d3.hsl(this.props.color);
    const borderColor = backgroundColor.darker();
    // Use dark font on brighter backgrounds and light font in darker backgrounds
    const textColor = backgroundColor.l > 0.6 ? d3.rgb('#333333') : d3.rgb('#FFFFFF');
    return (
      <Label style={{
        backgroundColor: backgroundColor.toString(),
        border: `1px solid ${borderColor.toString()}`,
        color: textColor.toString(),
      }}>
        {this.props.text}
      </Label>
    );
  }
}

export default ColorLabel;
