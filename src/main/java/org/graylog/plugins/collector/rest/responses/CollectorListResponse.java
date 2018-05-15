package org.graylog.plugins.collector.rest.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.rest.models.CollectorSummary;
import org.graylog2.database.PaginatedList;

import javax.annotation.Nullable;
import java.util.Collection;
import java.util.Map;

@AutoValue
public abstract class CollectorListResponse {
    @Nullable
    @JsonProperty
    public abstract String query();

    @JsonUnwrapped
    public abstract PaginatedList.PaginationInfo paginationInfo();

    @JsonProperty
    public abstract Boolean onlyActive();

    @Nullable
    @JsonProperty
    public abstract String sort();

    @Nullable
    @JsonProperty
    public abstract String order();

    @JsonProperty
    public abstract Collection<CollectorSummary> collectors();

    @Nullable
    @JsonProperty
    public abstract Map<String, String> filters();

    @JsonCreator
    public static CollectorListResponse create(@JsonProperty("query") @Nullable String query,
                                               @JsonProperty("pagination_info") PaginatedList.PaginationInfo paginationInfo,
                                               @JsonProperty("only_active") Boolean onlyActive,
                                               @JsonProperty("sort") @Nullable String sort,
                                               @JsonProperty("order") @Nullable String order,
                                               @JsonProperty("collectors") Collection<CollectorSummary> collectors,
                                               @JsonProperty("filters") @Nullable Map<String, String> filters) {
        return new AutoValue_CollectorListResponse(query, paginationInfo, onlyActive, sort, order, collectors, filters);
    }

    public static CollectorListResponse create(@JsonProperty("query") @Nullable String query,
                                               @JsonProperty("pagination_info") PaginatedList.PaginationInfo paginationInfo,
                                               @JsonProperty("only_active") Boolean onlyActive,
                                               @JsonProperty("sort") @Nullable String sort,
                                               @JsonProperty("order") @Nullable String order,
                                               @JsonProperty("collectors") Collection<CollectorSummary> collectors) {
        return create(query, paginationInfo, onlyActive, sort, order, collectors, null);
    }
}
