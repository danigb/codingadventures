'use strict';

module.exports = function(data, indexFn) {
  var store = function () {};
  store.values = [];
  store.index = {};
  store.groups = [];

  store.count = function() { return data.length; }
  store.keys = function() { return Object.keys(store.index); }
  store.get = function(key) { return store.index[key]; }
  store.all = function() { return store.groups; }

  store.add = function(item) {
    var key = indexFn(item);
    var indexed = store.get(key);
    if (indexed == null) {
      indexed = { key: key, values: []}
      store.index[key] = indexed;
      store.groups.push(indexed);
    }
    indexed.values.push(item);
    store.values.push(item);
  }

  store.each = function(fn) {
    store.groups.forEach(fn);
    return store;
  }

  data.forEach(store.add);
  return store;
}
