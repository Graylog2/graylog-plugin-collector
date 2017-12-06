import PropTypes from 'prop-types';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Input } from 'components/bootstrap';


import CollectorConfigurationsActions from 'configurations/CollectorConfigurationsActions';
import TagsSelect from '../collector-configuration/TagsSelect';

const AltConfigurationTags = React.createClass({
  propTypes: {
    configuration: PropTypes.object.isRequired,
    tags: PropTypes.array.isRequired,
    onConfigurationChange: PropTypes.func,
  },


  _updateTags(event) {
    event.preventDefault();
    const tags = this.refs.tags.getValue().filter((value) => value !== '');
    CollectorConfigurationsActions.updateTags(tags, this.props.configuration.id)
      .then(() => this._onSuccessfulUpdate());
  },

  _onSuccessfulUpdate(callback) {
    if (typeof callback === 'function') {
      callback();
    }
    if (typeof this.props.onConfigurationChange === 'function') {
      this.props.onConfigurationChange();
    }
  },

  render() {
    const availableTags = this.props.tags.map((tag) => {
      return { name: tag };
    });
    return (
      <Row className="content">
        <Col md={8}>
          <h2>Configuration tags</h2>
          <p>Manage tags for this configuration. Collectors using one of these tags will automatically apply this configuration.</p>
          <form className="form-horizontal" style={{ marginTop: 15 }} onSubmit={this._updateTags}>
            <Input id="tags-selector"
                   label="Tags"
                   help="Select a tag or create new ones by typing their name."
                   labelClassName="col-sm-2"
                   wrapperClassName="col-sm-10">
              <Row>
                <Col md={7}>
                  <TagsSelect ref="tags"
                              availableTags={availableTags}
                              tags={this.props.configuration.tags}
                              className="form-control" />
                </Col>
                <Col md={5} style={{ paddingLeft: 0 }}>
                  <Button bsStyle="success" type="submit">
                    Update tags
                  </Button>
                </Col>
              </Row>
            </Input>
          </form>
        </Col>
      </Row>
    );
  },
});
export default AltConfigurationTags;
