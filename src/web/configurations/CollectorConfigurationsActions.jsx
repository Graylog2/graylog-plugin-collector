import Reflux from 'reflux';

const CollectorConfigurationsActions = Reflux.createActions({
  list: { asyncResult: true },
  getConfiguration: { asyncResult: true },
  createConfiguration: { asyncResult: true },
  updateConfiguration: { asyncResult: true },
  saveTags: { asyncResult: true },
  saveOutput: { asyncResult: true },
  saveInput: { asyncResult: true },
  saveSnippet: { asyncResult: true },
  copyConfiguration: { asyncResult: true },
  copyOutput: { asyncResult: true },
  copyInput: { asyncResult: true },
  copySnippet: { asyncResult: true },
  delete: { asyncResult: true },
  deleteOutput: { asyncResult: true },
  deleteInput: { asyncResult: true },
  deleteSnippet: { asyncResult: true },
  updateTags: { asyncResult: true },
  listTags: { asyncResult: true },
});

export default CollectorConfigurationsActions;
