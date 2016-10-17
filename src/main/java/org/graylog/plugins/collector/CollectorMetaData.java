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
package org.graylog.plugins.collector;

import org.graylog2.plugin.PluginMetaData;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.Version;

import java.net.URI;
import java.util.EnumSet;
import java.util.Set;

/**
 * Implement the PluginMetaData interface here.
 */
public class CollectorMetaData implements PluginMetaData {
    private static final String PLUGIN_PROPERTIES = "org.graylog.plugins.graylog-plugin-collector/graylog-plugin.properties";

    @Override
    public String getUniqueId() {
        return "org.graylog.plugins.collector.CollectorPlugin";
    }

    @Override
    public String getName() {
        return "Collector";
    }

    @Override
    public String getAuthor() {
        return "Graylog, Inc.";
    }

    @Override
    public URI getURL() {
        return URI.create("https://www.graylog.org/");
    }

    @Override
    public Version getVersion() {
        return Version.fromPluginProperties(this.getClass(), PLUGIN_PROPERTIES, "version", Version.from(0, 0, 0, "unknown"));
    }

    @Override
    public String getDescription() {
        return "Collectors plugin";
    }

    @Override
    public Version getRequiredVersion() {
        return Version.fromPluginProperties(this.getClass(), PLUGIN_PROPERTIES, "graylog.version", Version.CURRENT_CLASSPATH);
    }

    @Override
    public Set<ServerStatus.Capability> getRequiredCapabilities() {
        return EnumSet.of(ServerStatus.Capability.SERVER);
    }
}
