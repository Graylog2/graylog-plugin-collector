import React from 'react';

import MultiSelect from 'components/common/MultiSelect';

const TagsSelect = React.createClass({
  propTypes: {
    tags: React.PropTypes.arrayOf(React.PropTypes.string),
    availableTags: React.PropTypes.array.isRequired,
  },

  getDefaultProps() {
    return {
      tags: [],
    };
  },

  getValue() {
    return this.refs.select.getValue().split(',');
  },

  render() {
    const tagsValue = this.props.tags.join(',');
    const tagsOptions = this.props.availableTags.map((tag) => {
      return { value: tag.name, label: tag.name };
    });
    return (
      <MultiSelect
        ref="select"
        options={tagsOptions}
        value={tagsValue}
        placeholder="Choose tags..."
        allowCreate
      />
    );
  },
});

export default TagsSelect;
