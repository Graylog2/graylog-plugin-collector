package org.graylog.plugins.collector.configurations.rest;

import com.codahale.metrics.MetricRegistry;
import com.github.joschi.jadconfig.util.Duration;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.google.common.util.concurrent.AbstractIdleService;
import org.graylog.plugins.collector.common.CollectorPluginConfiguration;
import org.graylog.plugins.collector.configurations.CollectorConfigurationService;
import org.graylog2.events.ClusterEventBus;
import org.graylog2.metrics.CacheStatsSet;
import org.graylog2.shared.metrics.MetricUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;

import static com.codahale.metrics.MetricRegistry.name;

@Singleton
public class ConfigurationEtagService extends AbstractIdleService {
    private static final Logger LOG = LoggerFactory.getLogger(ConfigurationEtagService.class);

    private final Cache<String, String> cache;
    private MetricRegistry metricRegistry;
    private EventBus eventBus;
    private ClusterEventBus clusterEventBus;

    @Inject
    public ConfigurationEtagService(CollectorPluginConfiguration pluginConfiguration,
                                    MetricRegistry metricRegistry,
                                    EventBus eventBus,
                                    ClusterEventBus clusterEventBus) {
        this.metricRegistry = metricRegistry;
        this.eventBus = eventBus;
        this.clusterEventBus = clusterEventBus;
        Duration cacheTime = pluginConfiguration.getCacheTime();
        cache = CacheBuilder.newBuilder()
                .recordStats()
                .expireAfterWrite(cacheTime.getQuantity(), cacheTime.getUnit())
                .maximumSize(pluginConfiguration.getCacheMaxSize())
                .build();
    }

    @Subscribe
    public void handleEtagInvalidation(CollectorConfigurationEtagInvalidation event) {
        if (event.etag().equals("")) {
            LOG.trace("Invalidating all collector configuration etags");
            cache.invalidateAll();
        } else {
            LOG.trace("Invalidating collector configuration etag {}", event.etag());
            cache.invalidate(event.etag());
        }
    }

    public boolean isPresent(String etag) {
        return cache.getIfPresent(etag) != null;
    }

    public void put(String etag) {
        cache.put(etag, etag);
    }

    public void invalidate(String etag) {
        clusterEventBus.post(CollectorConfigurationEtagInvalidation.etag(etag));
    }

    public void invalidateAll() {
        cache.invalidateAll();
        clusterEventBus.post(CollectorConfigurationEtagInvalidation.etag(""));
    }

    @Override
    protected void startUp() throws Exception {
        eventBus.register(this);
        MetricUtils.safelyRegisterAll(metricRegistry, new CacheStatsSet(name(CollectorConfigurationService.class, "etag-cache"), cache));
    }

    @Override
    protected void shutDown() throws Exception {
        eventBus.unregister(this);
        metricRegistry.removeMatching((name, metric) -> name.startsWith(name(CollectorConfigurationService.class, "etag-cache")));
    }
}
