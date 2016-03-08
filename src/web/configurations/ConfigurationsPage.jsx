import React from 'react';

import { Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocsHelper from 'util/DocsHelper';

import PageHeader from 'components/common/PageHeader';
import ConfigurationsList from './ConfigurationsList';

const ConfigurationsPage = React.createClass({
    render() {
        return (
            <span>
                <PageHeader title="Collector Configuration List" titleSize={8} buttonSize={4} buttonStyle={{textAlign: 'right', marginTop: '10px'}}>
                    <span>
                        Create sidecar configurations.
                    </span>
                    {null}
                    <span>
                        <LinkContainer to={'/system/collectors/'}>
                            <a className="btn btn-info">Show Collectors</a>
                        </LinkContainer>
                    </span>
                </PageHeader>

                <Row className="content">
                    <Col md={12}>
                        <ConfigurationsList />
                    </Col>
                </Row>
            </span>
        );
    }
});

export default ConfigurationsPage;
