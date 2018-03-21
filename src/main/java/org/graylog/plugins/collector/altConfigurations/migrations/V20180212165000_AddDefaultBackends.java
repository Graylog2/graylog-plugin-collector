package org.graylog.plugins.collector.altConfigurations.migrations;

import org.graylog.plugins.collector.altConfigurations.BackendService;
import org.graylog.plugins.collector.altConfigurations.rest.models.CollectorBackend;
import org.graylog2.migrations.Migration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class V20180212165000_AddDefaultBackends extends Migration {
    private static final Logger LOG = LoggerFactory.getLogger(V20180212165000_AddDefaultBackends.class);

    private final BackendService backendService;

    @Inject
    public V20180212165000_AddDefaultBackends(BackendService backendService) {
        this.backendService = backendService;
    }

    @Override
    public ZonedDateTime createdAt() {
        return ZonedDateTime.parse("2018-02-12T16:50:00Z");
    }

    @Override
    public void upgrade() {
        ensureBackend(
                "filebeat",
                "exec",
                "linux",
                "/usr/bin/filebeat",
                "/etc/graylog/collector-sidecar/generated/filebeat.yml",
                new ArrayList<String>(Arrays.asList("-c",  "%s")),
                new ArrayList<String>(Arrays.asList("-configtest", "-c", "%s"))
        );
        ensureBackend(
                "winlogbeat",
                "svc",
                "windows",
                "C:\\Program Files\\graylog\\collector-sidecar\\winlogbeat.exe",
                "C:\\Program Files\\graylog\\collector-sidecar\\generated\\winlogbeat.yml",
                new ArrayList<String>(Arrays.asList("-c", "%s")),
                new ArrayList<String>(Arrays.asList("-configtest", "-c", "%s"))
        );
        ensureBackend(
                "nxlog",
                "exec",
                "linux",
                "/usr/bin/nxlog",
                "/etc/graylog/collector-sidecar/generated/nxlog.conf",
                new ArrayList<String>(Arrays.asList("-f", "-c", "%s")),
                new ArrayList<String>(Arrays.asList("-v", "-c", "%s"))
        );
    }

    @Nullable
    private String ensureBackend(String backendName,
                                 String serviceType,
                                 String nodeOperatingSystem,
                                 String executablePath,
                                 String configurationPath,
                                 List<String> executeParameters,
                                 List<String> validationCommand) {
        CollectorBackend backend = null;
        try {
            backend = backendService.loadForName(backendName);
            if (backend == null) {
                final String msg = "Couldn't find backend '" + backendName + "' fixing it.";
                LOG.error(msg);
                throw new IllegalArgumentException(msg);
            }
        } catch (IllegalArgumentException ignored) {
            LOG.info("{} backend is missing, adding it.", backendName);
            final CollectorBackend collectorBackend;
            collectorBackend = CollectorBackend.create(
                    null,
                    backendName,
                    serviceType,
                    nodeOperatingSystem,
                    executablePath,
                    configurationPath,
                    executeParameters,
                    validationCommand
            );
            try {
                return backendService.save(collectorBackend).id();
            } catch (Exception e) {
                LOG.error("Can't save backend " + backendName + ", please restart Graylog to fix this.", e);
            }
        }

        if (backend == null) {
            LOG.error("Unable to access fixed " + backendName + " backend, please restart Graylog to fix this.");
            return null;
        }

        return backend.id();
    }

}
