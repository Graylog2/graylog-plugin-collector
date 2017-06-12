import React from 'react';
import { Button } from 'react-bootstrap';
import Immutable from 'immutable';

import { TypeAheadInput } from 'components/common';

const CollectorFilter = React.createClass({
  propTypes: {
    data: React.PropTypes.array.isRequired,
    searchInKeys: React.PropTypes.array.isRequired,
    filterBy: React.PropTypes.string.isRequired,
    onDataFiltered: React.PropTypes.func.isRequired,
    displayKey: React.PropTypes.string,
    filterData: React.PropTypes.func,
    filterSuggestionAccessor: React.PropTypes.string,
    filterSuggestions: React.PropTypes.array,
    label: React.PropTypes.string,
  },
  getDefaultProps() {
    return {
      label: 'Filter',
      displayKey: 'value',
      filterData: undefined,
      filterSuggestionAccessor: undefined,
      filterSuggestions: [],
    };
  },
  getInitialState() {
    return {
      filterText: '',
      filters: Immutable.OrderedSet(),
    };
  },
  _onSearchTextChanged(event) {
    event.preventDefault();
    this.setState({ filterText: this._typeAheadInput.getValue() }, this.filterData);
  },
  _onFilterAdded(event, suggestion) {
    this.setState({
      filters: this.state.filters.add(suggestion[this.props.displayKey]),
      filterText: '',
    }, this.filterData);
    this._typeAheadInput.clear();
  },
  _onFilterRemoved(event) {
    event.preventDefault();
    this.setState({ filters: this.state.filters.delete(event.target.getAttribute('data-target')) }, this.filterData);
  },
  _matchFilters(datum) {
    return this.state.filters.every((filter) => {
      let dataToFilter = datum[this.props.filterBy];

      if (!dataToFilter) {
        return false;
      }
      if (this.props.filterSuggestionAccessor) {
        dataToFilter = dataToFilter.map(data => data[this.props.filterSuggestionAccessor].toLocaleLowerCase());
      } else {
        dataToFilter = dataToFilter.map(data => data.toLocaleLowerCase());
      }

      return dataToFilter.indexOf(filter.toLocaleLowerCase()) !== -1;
    }, this);
  },
  _matchStringSearch(datum) {
    return this.props.searchInKeys.some((searchInKey) => {
      const key = datum[searchInKey];
      const value = this.state.filterText;

      if (key === null) {
        return false;
      }
      const containsFilter = (entry, thisValue) => {
        if (typeof entry === 'undefined') {
          return false;
        }
        return entry.toLocaleLowerCase().indexOf(thisValue.toLocaleLowerCase()) !== -1;
      };

      if (typeof key === 'object') {
        return key.some(arrayEntry => containsFilter(arrayEntry, value));
      }
      return containsFilter(key, value);
    }, this);
  },
  _resetFilters() {
    this._typeAheadInput.clear();
    this.setState({ filterText: '', filters: Immutable.OrderedSet() }, this.filterData);
  },
  _getStatusText(state) {
    switch (state) {
      case 0:
        return 'Running';
      case 1:
        return 'Unknown';
      case 2:
        return 'Failing';
      default:
        return 'Unknown';
    }
  },
  _transform(collectors) {
    return collectors.map((collector) => {
      const transformedCollector = {
        id: collector.id,
        name: collector.node_id,
        tags: [''],
        operating_system: '',
        status: 'Unknown',
      };
      if (collector.node_details) {
        transformedCollector.tags = collector.node_details.tags;
        transformedCollector.operating_system = collector.node_details.operating_system;
      }
      if (collector.node_details.status) {
        transformedCollector.status = this._getStatusText(collector.node_details.status.status);
      }
      return transformedCollector;
    });
  },
  filterData() {
    if (typeof this.props.filterData === 'function') {
      return this.props.filterData(this.props.data);
    }

    const transformedData = this._transform(this.props.data);
    const filteredData = transformedData.filter((datum) => {
      return this._matchFilters(datum) && this._matchStringSearch(datum);
    });

    const mappedData = filteredData.map((datum) => {
      return this.props.data.find((collector) => {
        return collector.id === datum.id;
      });
    });

    this.props.onDataFiltered(mappedData);
  },
  render() {
    const filters = this.state.filters.map((filter) => {
      return (
        <li key={`li-${filter}`}>
          <span className="pill label label-default">
            {this.props.filterBy}: {filter}
            <a className="tag-remove" data-target={filter} onClick={this._onFilterRemoved} />
          </span>
        </li>
      );
    });

    let suggestions;

    if (this.props.filterSuggestionAccessor) {
      suggestions = this.props.filterSuggestions.map(filterSuggestion => filterSuggestion[this.props.filterSuggestionAccessor].toLocaleLowerCase());
    } else if (this.props.filterSuggestions.length > 0){
      suggestions = this.props.filterSuggestions.map(filterSuggestion => filterSuggestion.toLocaleLowerCase());
    } else {
      let filterByValues = [];
      this._transform(this.props.data).forEach((collector) => {
        if (!collector[this.props.filterBy]) {
          return;
        }
        if (Array.isArray(collector[this.props.filterBy])) {
          filterByValues = filterByValues.concat(collector[this.props.filterBy]);
        } else {
          filterByValues = filterByValues.concat([collector[this.props.filterBy]]);
        }
      });
      suggestions = filterByValues.filter((value, index, self) => self.indexOf(value) === index);
    }

    suggestions.filter(filterSuggestion => !this.state.filters.includes(filterSuggestion));

    return (
      <div className="filter">
        <form className="form-inline" onSubmit={this._onSearchTextChanged} style={{ display: 'inline' }}>
          <TypeAheadInput ref={(c) => { this._typeAheadInput = c; }}
                          onSuggestionSelected={this._onFilterAdded}
                          suggestionText={`Filter by ${this.props.filterBy}: `}
                          suggestions={suggestions}
                          label={this.props.label}
                          displayKey={this.props.displayKey} />
          <Button type="submit" style={{ marginLeft: 5 }}>Filter</Button>
          <Button type="button" style={{ marginLeft: 5 }} onClick={this._resetFilters}
                  disabled={this.state.filters.count() === 0 && this.state.filterText === ''}>
            Reset
          </Button>
        </form>
        <ul className="pill-list">
          {filters}
        </ul>
      </div>
    );
  },
});

export default CollectorFilter;
