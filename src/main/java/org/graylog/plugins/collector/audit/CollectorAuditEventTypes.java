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
/**
 * This file is part of Graylog Pipeline Processor.
 *
 * Graylog Pipeline Processor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog Pipeline Processor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog Pipeline Processor.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.graylog.plugins.collector.audit;

import com.google.common.collect.ImmutableSet;
import org.graylog2.audit.PluginAuditEventTypes;

import java.util.Set;

public class CollectorAuditEventTypes implements PluginAuditEventTypes {
    private static final String NAMESPACE = "collector:";

    public static final String ACTION_UPDATE = NAMESPACE + "action:update";

    public static final String CONFIGURATION_CREATE = NAMESPACE + "configuration:create";
    public static final String CONFIGURATION_UPDATE = NAMESPACE + "configuration:update";
    public static final String CONFIGURATION_DELETE = NAMESPACE + "configuration:delete";
    public static final String CONFIGURATION_CLONE = NAMESPACE + "configuration:clone";

    public static final String TAGS_UPDATE = NAMESPACE + "tags:update";

    public static final String INPUT_CREATE = NAMESPACE + "input:create";
    public static final String INPUT_UPDATE = NAMESPACE + "input:update";
    public static final String INPUT_DELETE = NAMESPACE + "input:delete";
    public static final String INPUT_CLONE = NAMESPACE + "input:clone";

    public static final String OUTPUT_CREATE = NAMESPACE + "output:create";
    public static final String OUTPUT_UPDATE = NAMESPACE + "output:update";
    public static final String OUTPUT_DELETE = NAMESPACE + "output:delete";
    public static final String OUTPUT_CLONE = NAMESPACE + "output:clone";

    public static final String SNIPPET_CREATE = NAMESPACE + "snippet:create";
    public static final String SNIPPET_UPDATE = NAMESPACE + "snippet:update";
    public static final String SNIPPET_DELETE = NAMESPACE + "snippet:delete";
    public static final String SNIPPET_CLONE = NAMESPACE + "snippet:clone";


    private static final Set<String> EVENT_TYPES = ImmutableSet.<String>builder()
            .add(ACTION_UPDATE)
            .add(CONFIGURATION_CREATE)
            .add(CONFIGURATION_UPDATE)
            .add(CONFIGURATION_DELETE)
            .add(CONFIGURATION_CLONE)
            .add(TAGS_UPDATE)
            .add(INPUT_CREATE)
            .add(INPUT_UPDATE)
            .add(INPUT_DELETE)
            .add(INPUT_CLONE)
            .add(OUTPUT_CREATE)
            .add(OUTPUT_UPDATE)
            .add(OUTPUT_DELETE)
            .add(OUTPUT_CLONE)
            .add(SNIPPET_CREATE)
            .add(SNIPPET_UPDATE)
            .add(SNIPPET_DELETE)
            .add(SNIPPET_CLONE)
            .build();

    @Override
    public Set<String> auditEventTypes() {
        return EVENT_TYPES;
    }
}
