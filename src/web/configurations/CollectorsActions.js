import Reflux from 'reflux';

const CollectorsActions = Reflux.createActions({
  getCollector: { asyncResult: true },
  list: { asyncResult: true },
  create: { asyncResult: true },
  update: { asyncResult: true },
});

export default CollectorsActions;
