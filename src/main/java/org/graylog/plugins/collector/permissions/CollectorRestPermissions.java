/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog.plugins.collector.permissions;

import com.google.common.collect.ImmutableSet;
import org.graylog2.plugin.security.Permission;
import org.graylog2.plugin.security.PluginPermissions;

import java.util.Collections;
import java.util.Set;

import static org.graylog2.plugin.security.Permission.create;

public class CollectorRestPermissions implements PluginPermissions {
    public static final String COLLECTORS_READ = "collectors:read";
    public static final String COLLECTORS_CREATE = "collectors:create";
    public static final String COLLECTORS_UPDATE = "collectors:update";
    public static final String COLLECTORS_DELETE = "collectors:delete";

    private final ImmutableSet<Permission> permissions = ImmutableSet.of(
            create(COLLECTORS_READ, "Read collectors"),
            create(COLLECTORS_CREATE, "Create collectors"),
            create(COLLECTORS_UPDATE, "Update collectors"),
            create(COLLECTORS_DELETE, "Delete collectors")
    );

    @Override
    public Set<Permission> permissions() {
        return permissions;
    }

    @Override
    public Set<Permission> readerBasePermissions() {
        return Collections.emptySet();
    }
}
