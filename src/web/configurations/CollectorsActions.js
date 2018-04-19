import Reflux from 'reflux';

const CollectorsActions = Reflux.createActions({
  list: { asyncResult: true },
  create: { asyncResult: true },
  update: { asyncResult: true },
});

export default CollectorsActions;
