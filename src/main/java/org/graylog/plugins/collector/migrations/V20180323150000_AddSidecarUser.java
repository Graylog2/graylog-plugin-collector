package org.graylog.plugins.collector.migrations;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import com.mongodb.DuplicateKeyException;
import org.graylog.plugins.collector.common.CollectorPluginConfiguration;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog2.database.NotFoundException;
import org.graylog2.migrations.Migration;
import org.graylog2.plugin.database.ValidationException;
import org.graylog2.plugin.database.users.User;
import org.graylog2.shared.security.RestPermissions;
import org.graylog2.shared.users.Role;
import org.graylog2.shared.users.UserService;
import org.graylog2.users.RoleImpl;
import org.graylog2.users.RoleService;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

public class V20180323150000_AddSidecarUser extends Migration {
    private static final Logger LOG = LoggerFactory.getLogger(V20180323150000_AddSidecarUser.class);

    private final UserService userService;
    private final RoleService roleService;
    private final CollectorRestPermissions collectorRestPermissions;
    private final String sidecarUser;

    @Inject
    public V20180323150000_AddSidecarUser(CollectorPluginConfiguration pluginConfiguration,
                                         UserService userService,
                                         RoleService roleService,
                                         CollectorRestPermissions collectorRestPermissions) {
        this.userService = userService;
        this.roleService = roleService;
        this.collectorRestPermissions = collectorRestPermissions;
        this.sidecarUser = pluginConfiguration.getUser();
    }

    @Override
    public ZonedDateTime createdAt() {
        return ZonedDateTime.parse("2018-03-23T15:00:00Z");
    }

    @Override
    public void upgrade() {
        final String roleId = ensureBuiltinRole(
                "Sidecar Node",
                "Grants access to register and pull configurations for a Sidecar node (built-in)",
                ImmutableSet.of(
                        CollectorRestPermissions.COLLECTORS_READ,
                        CollectorRestPermissions.COLLECTORS_UPDATE,
                        RestPermissions.USERS_LIST));

        ensureUser(
                sidecarUser,
                UUID.randomUUID().toString(),
                Sets.newHashSet(
                        roleId,
                        roleService.getReaderRoleObjectId()));
    }

    @Nullable
    private String ensureUser(String userName, String password, Set<String> expectedRoles) {
        User previousUser = null;
        try {
            previousUser = userService.load(userName);
            if (previousUser == null || !expectedRoles.equals(previousUser.getRoleIds())) {
                final String msg = "Invalid user '" + userName + "' fixing it.";
                LOG.error(msg);
                throw new IllegalArgumentException(msg);
            }
        } catch (IllegalArgumentException ignored) {
            LOG.info("{} user is missing or invalid, re-adding it as a built-in user.", userName);
            final User fixedUser;
            if (previousUser != null) {
                fixedUser = previousUser;
                fixedUser.setRoleIds(expectedRoles);
            } else {
                fixedUser = userService.create();
                fixedUser.setName(this.sidecarUser);
                fixedUser.setFullName("Sidecar System User (build-in)");
                fixedUser.setPassword(password);
                fixedUser.setEmail("sidecar@graylog.local");
                fixedUser.setPermissions(Collections.emptyList());
                fixedUser.setRoleIds(expectedRoles);
                fixedUser.setTimeZone(DateTimeZone.UTC);
            }
            try {
                return userService.save(fixedUser);
            } catch (ValidationException e) {
                LOG.error("Unabale to save fixed " + userName + " user, please restart Graylog to fix this.", e);
            }
        }

        if (previousUser == null) {
            LOG.error("Unable to access fixed " + userName + " user, please restart Graylog to fix this.");
            return null;
        }

        return previousUser.getId();
    }

    @Nullable
    private String ensureBuiltinRole(String roleName, String description, Set<String> expectedPermissions) {
        Role previousRole = null;
        try {
            previousRole = roleService.load(roleName);
            if (!previousRole.isReadOnly() || !expectedPermissions.equals(previousRole.getPermissions())) {
                final String msg = "Invalid role '" + roleName + "', fixing it.";
                LOG.error(msg);
                throw new IllegalArgumentException(msg); // jump to fix code
            }
        } catch (NotFoundException | IllegalArgumentException | NoSuchElementException ignored) {
            LOG.info("{} role is missing or invalid, re-adding it as a built-in role.", roleName);
            final RoleImpl fixedRole = new RoleImpl();
            // copy the mongodb id over, in order to update the role instead of readding it
            if (previousRole != null) {
                fixedRole._id = previousRole.getId();
            }
            fixedRole.setReadOnly(true);
            fixedRole.setName(roleName);
            fixedRole.setDescription(description);
            fixedRole.setPermissions(expectedPermissions);

            try {
                final Role savedRole = roleService.save(fixedRole);
                return savedRole.getId();
            } catch (DuplicateKeyException | ValidationException e) {
                LOG.error("Unable to save fixed " + roleName + " role, please restart Graylog to fix this.", e);
            }
        }

        if (previousRole == null) {
            LOG.error("Unable to access fixed " + roleName + " role, please restart Graylog to fix this.");
            return null;
        }

        return previousRole.getId();
    }
}
