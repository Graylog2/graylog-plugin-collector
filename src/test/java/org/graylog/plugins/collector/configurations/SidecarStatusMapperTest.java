package org.graylog.plugins.collector.configurations;

import org.graylog.plugins.collector.mapper.CollectorStatusMapper;
import org.junit.Test;

import static org.assertj.core.api.Java6Assertions.assertThat;


public class SidecarStatusMapperTest {

    @Test
    public void replaceStringStatusSearchQuery() {
        final CollectorStatusMapper collectorStatusMapper = new CollectorStatusMapper();

        assertThat(collectorStatusMapper.replaceStringStatusSearchQuery("status:running")).isEqualTo("status:0");
        assertThat(collectorStatusMapper.replaceStringStatusSearchQuery("status:unknown")).isEqualTo("status:1");
        assertThat(collectorStatusMapper.replaceStringStatusSearchQuery("status:failing")).isEqualTo("status:2");

        assertThat(collectorStatusMapper.replaceStringStatusSearchQuery("status:failing, status:running")).isEqualTo("status:2, status:0");
        assertThat(collectorStatusMapper.replaceStringStatusSearchQuery("status:failing, foobar")).isEqualTo("status:2, foobar");
        assertThat(collectorStatusMapper.replaceStringStatusSearchQuery("lol:wut, status:failing")).isEqualTo("lol:wut, status:2");
        assertThat(collectorStatusMapper.replaceStringStatusSearchQuery("lol:wut, status:failing, foobar")).isEqualTo("lol:wut, status:2, foobar");
    }
}