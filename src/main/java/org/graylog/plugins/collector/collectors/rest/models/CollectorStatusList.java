/**
 * This file is part of Graylog.
 *
 * Graylog is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.graylog.plugins.collector.collectors.rest.models;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import javax.annotation.Nullable;
import java.util.HashMap;
import java.util.List;

@AutoValue
@JsonAutoDetect
public abstract class CollectorStatusList {
    @JsonProperty("status")
    public abstract int status();

    @JsonProperty("message")
    public abstract String message();

    @JsonProperty("tags")
    @Nullable
    public abstract List<String> tags();

    @JsonProperty("disks75")
    @Nullable
    public abstract List<String> disks75();

    @JsonProperty("load1")
    @Nullable
    public abstract float load1();

    @JsonProperty("backends")
    public abstract HashMap<String, CollectorStatus> backends();

    @JsonCreator
    public static CollectorStatusList create(@JsonProperty("status") int status,
                                             @JsonProperty("message") String message,
                                             @JsonProperty("tags") @Nullable List<String> tags,
                                             @JsonProperty("disks75") @Nullable List<String> disks75,
                                             @JsonProperty("load1") @Nullable float load1,
                                             @JsonProperty("backends") HashMap<String, CollectorStatus> backends) {
        return new AutoValue_CollectorStatusList(status, message, tags, disks75, load1, backends);
    }}
