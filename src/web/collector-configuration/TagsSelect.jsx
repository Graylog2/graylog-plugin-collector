import PropTypes from 'prop-types';
import React from 'react';

import MultiSelect from 'components/common/MultiSelect';

class TagsSelect extends React.Component {
  static propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string),
    availableTags: PropTypes.array.isRequired,
  };

  static defaultProps = {
    tags: [],
  };

  getValue = () => {
    return this.refs.select.getValue().split(',');
  };

  render() {
    const tagsValue = this.props.tags.join(',');
    const tagsOptions = this.props.availableTags.map((tag) => {
      return { value: tag.name, label: tag.name };
    });
    return (
      <MultiSelect ref="select"
                   options={tagsOptions}
                   value={tagsValue}
                   placeholder="Choose tags..."
                   allowCreate />
    );
  }
}

export default TagsSelect;
