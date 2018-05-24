package org.graylog.plugins.collector.migrations;

import org.graylog.plugins.collector.rest.models.Collector;
import org.graylog.plugins.collector.services.CollectorService;
import org.graylog2.migrations.Migration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class V20180212165000_AddDefaultCollectors extends Migration {
    private static final Logger LOG = LoggerFactory.getLogger(V20180212165000_AddDefaultCollectors.class);

    private final CollectorService collectorService;

    @Inject
    public V20180212165000_AddDefaultCollectors(CollectorService collectorService) {
        this.collectorService = collectorService;
    }

    @Override
    public ZonedDateTime createdAt() {
        return ZonedDateTime.parse("2018-02-12T16:50:00Z");
    }

    @Override
    public void upgrade() {
        ensureCollector(
                "filebeat",
                "exec",
                "linux",
                "/usr/bin/filebeat",
                "/etc/graylog/collector-sidecar/generated/filebeat.yml",
                new ArrayList<String>(Arrays.asList("-c",  "%s")),
                new ArrayList<String>(Arrays.asList("test", "config", "-c", "%s")),
                ""
        );
        ensureCollector(
                "winlogbeat",
                "svc",
                "windows",
                "C:\\Program Files\\graylog\\collector-sidecar\\winlogbeat.exe",
                "C:\\Program Files\\graylog\\collector-sidecar\\generated\\winlogbeat.yml",
                new ArrayList<String>(Arrays.asList("-c", "%s")),
                new ArrayList<String>(Arrays.asList("test", "config", "-c", "%s")),
                ""
        );
        ensureCollector(
                "nxlog",
                "exec",
                "linux",
                "/usr/bin/nxlog",
                "/etc/graylog/collector-sidecar/generated/nxlog.conf",
                new ArrayList<String>(Arrays.asList("-f", "-c", "%s")),
                new ArrayList<String>(Arrays.asList("-v", "-c", "%s")),
                ""
        );
    }

    @Nullable
    private String ensureCollector(String collectorName,
                                   String serviceType,
                                   String nodeOperatingSystem,
                                   String executablePath,
                                   String configurationPath,
                                   List<String> executeParameters,
                                   List<String> validationCommand,
                                   String defaultTemplate) {
        Collector collector = null;
        try {
            collector = collectorService.findByName(collectorName);
            if (collector == null) {
                final String msg = "Couldn't find collector '" + collectorName + "' fixing it.";
                LOG.error(msg);
                throw new IllegalArgumentException(msg);
            }
        } catch (IllegalArgumentException ignored) {
            LOG.info("{} collector is missing, adding it.", collectorName);
            final Collector newCollector;
            newCollector = Collector.create(
                    null,
                    collectorName,
                    serviceType,
                    nodeOperatingSystem,
                    executablePath,
                    configurationPath,
                    executeParameters,
                    validationCommand,
                    defaultTemplate
            );
            try {
                return collectorService.save(newCollector).id();
            } catch (Exception e) {
                LOG.error("Can't save collector " + collectorName + ", please restart Graylog to fix this.", e);
            }
        }

        if (collector == null) {
            LOG.error("Unable to access fixed " + collectorName + " collector, please restart Graylog to fix this.");
            return null;
        }

        return collector.id();
    }

}
