package org.graylog.plugins.collector.rest.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.collector.rest.models.CollectorBackendSummary;
import org.graylog2.database.PaginatedList;

import javax.annotation.Nullable;
import java.util.Collection;

@AutoValue
public abstract class CollectorBackendSummaryResponse {
    @Nullable
    @JsonProperty
    public abstract String query();

    @JsonUnwrapped
    public abstract PaginatedList.PaginationInfo paginationInfo();

    @Nullable
    @JsonProperty
    public abstract String sort();

    @Nullable
    @JsonProperty
    public abstract String order();

    @JsonProperty
    public abstract Collection<CollectorBackendSummary> backends();

    @JsonCreator
    public static CollectorBackendSummaryResponse create(@JsonProperty("query") @Nullable String query,
                                                         @JsonProperty("pagination_info") PaginatedList.PaginationInfo paginationInfo,
                                                         @JsonProperty("sort") String sort,
                                                         @JsonProperty("order") String order,
                                                         @JsonProperty("backends") Collection<CollectorBackendSummary> backends) {
        return new AutoValue_CollectorBackendSummaryResponse(query, paginationInfo, sort, order, backends);
    }
}
