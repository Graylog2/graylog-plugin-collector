import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';

import CollectorsActions from './CollectorsActions';

const CollectorsStore = Reflux.createStore({
    listenables: [CollectorsActions],
    sourceUrl: '/plugins/org.graylog.plugins.collector/collectors',
    collectors: undefined,

    init() {
        this.trigger({collectors: this.collectors});
    },

    list() {
        const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl));
        promise
            .then(
                response => {
                    this.collectors = response.collectors;
                    this.trigger({collectors: this.collectors});

                    return this.collectors;
                },
                error => {
                    UserNotification.error('Fetching Collectors failed with status: ' + error,
                        'Could not retrieve Collectors');
                });
        CollectorsActions.list.promise(promise);
    },

});

export default CollectorsStore;
