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
