import Reflux from 'reflux';

const AdministrationActions = Reflux.createActions({
  list: { asyncResult: true },
});

export default AdministrationActions;
