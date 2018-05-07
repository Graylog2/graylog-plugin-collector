package org.graylog.plugins.collector.altConfigurations;

import org.graylog.plugins.collector.altConfigurations.filter.AdministrationFilter;
import org.graylog.plugins.collector.altConfigurations.rest.models.Collector;

import javax.inject.Inject;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;

public class AdministrationFiltersFactory {
    private final AdministrationFilter.Factory administrationFilterFactory;

    @Inject
    public AdministrationFiltersFactory(AdministrationFilter.Factory administrationFilterFactory) {
        this.administrationFilterFactory = administrationFilterFactory;
    }

    public Optional<Predicate<Collector>> getFilters(Map<String, String> filters) {
        return filters.entrySet().stream()
                .map((Function<Map.Entry<String, String>, Predicate<Collector>>) entry -> {
                    final String name = entry.getKey();
                    final String value = entry.getValue();

                    final AdministrationFilter.Type filter = AdministrationFilter.Type.valueOf(name.toUpperCase());
                    switch (filter) {
                        case BACKEND:
                            return administrationFilterFactory.createBackendFilter(value);
                        case CONFIGURATION:
                            return administrationFilterFactory.createConfigurationFilter(value);
                        case OS:
                            return administrationFilterFactory.createOsFilter(value);
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .reduce(Predicate::and);
    }
}
