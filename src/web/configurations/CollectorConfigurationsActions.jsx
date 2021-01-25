/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
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
