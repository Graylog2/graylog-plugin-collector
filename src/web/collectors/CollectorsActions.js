import Reflux from 'reflux';

const CollectorsActions = Reflux.createActions({
  list: { asyncResult: true },
  getCollector: { asyncResult: true },
});

export default CollectorsActions;
