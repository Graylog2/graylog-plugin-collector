import Reflux from 'reflux';

const BackendsActions = Reflux.createActions({
  list: { asyncResult: true },
});

export default BackendsActions;
