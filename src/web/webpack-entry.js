import URI from 'urijs';

import AppConfig from 'util/AppConfig';

// The webpack-dev-server serves the assets from "/"
const assetPrefix = AppConfig.gl2DevMode() ? '/' : '/assets/plugin/org.graylog.plugins.collector.CollectorPlugin/';

// If app prefix was not set, we need to tell webpack to load chunks from root instead of the relative URL path
__webpack_public_path__ = URI.joinPaths(AppConfig.gl2AppPathPrefix(), assetPrefix).path() || assetPrefix;
