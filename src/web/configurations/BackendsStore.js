import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import UserNotification from 'util/UserNotification';

import BackendsActions from './BackendsActions';

const BackendsStore = Reflux.createStore({
  listenables: [BackendsActions],
  backends: undefined,

  getInitialState() {
    return {
      backends: this.backends,
    };
  },

  list() {
    const promise = fetch('GET', URLUtils.qualifyUrl('/plugins/org.graylog.plugins.collector/altconfiguration/backends'))
      .then(
        (response) => {
          this.backends = response.backends;
          this.trigger({ backends: this.backends });

          return this.backends;
        },
        (error) => {
          UserNotification.error(`Fetching collector backends failed with status: ${error}`,
            'Could not retrieve backends');
        });
    BackendsActions.list.promise(promise);
  },
});

export default BackendsStore;
