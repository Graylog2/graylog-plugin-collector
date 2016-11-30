import Reflux from 'reflux';

const CollectorsActions = Reflux.createActions({
  list: { asyncResult: true },
  getCollector: { asyncResult: true },
  getCollectorActions: { asyncResult: true },
  restartCollectorBackend: { asyncResult: true },
});

export default CollectorsActions;
