package org.graylog.plugins.collector.altConfigurations.rest.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.google.auto.value.AutoValue;
import org.graylog2.database.PaginatedList;

import javax.annotation.Nullable;
import java.util.Collection;

@AutoValue
public abstract class CollectorListResponse {
    @Nullable
    @JsonProperty
    public abstract String query();

    @JsonUnwrapped
    public abstract PaginatedList.PaginationInfo paginationInfo();

    @JsonProperty
    public abstract Collection<CollectorSummary> collectors();

    @JsonCreator
    public static CollectorListResponse create(@JsonProperty("query") @Nullable String query,
                                               @JsonProperty("pagination_info") PaginatedList.PaginationInfo paginationInfo,
                                               @JsonProperty("collectors") Collection<CollectorSummary> collectors) {
        return new AutoValue_CollectorListResponse(query, paginationInfo, collectors);
    }
}
