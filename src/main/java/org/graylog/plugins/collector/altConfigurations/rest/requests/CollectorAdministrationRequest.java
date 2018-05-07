package org.graylog.plugins.collector.altConfigurations.rest.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import javax.annotation.Nullable;
import java.util.HashMap;
import java.util.Map;

import static org.apache.commons.lang3.ObjectUtils.firstNonNull;

@AutoValue
@JsonAutoDetect
public abstract class CollectorAdministrationRequest {
    private final static int DEFAULT_PAGE = 1;
    private final static int DEFAULT_PER_PAGE = 50;

    @JsonProperty
    public abstract int page();

    @JsonProperty
    public abstract int perPage();

    @JsonProperty
    public abstract String query();

    @JsonProperty
    public abstract Map<String, String> filters();

    @JsonCreator
    public static CollectorAdministrationRequest create(@JsonProperty("page") int page,
                                                        @JsonProperty("per_page") int perPage,
                                                        @JsonProperty("query") @Nullable String query,
                                                        @JsonProperty("filters") @Nullable Map<String, String> filters) {
        final int effectivePage = page == 0 ? DEFAULT_PAGE : page;
        final int effectivePerPage = perPage == 0 ? DEFAULT_PER_PAGE : perPage;
        return new AutoValue_CollectorAdministrationRequest(
                effectivePage,
                effectivePerPage,
                firstNonNull(query, ""),
                firstNonNull(filters, new HashMap<>()));
    }
}
