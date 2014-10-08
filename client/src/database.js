var db = null;
var Api = {};

Api.open = function () {
  return new Promise(function (resolve, reject) {
    if (db) {
      return resolve();
    }

    var req = indexedDB.open('palef', 1);
    req.onsuccess = function () {
      db = this.result;
      resolve();
    };
    req.onerror = function (event) {
      reject(Error(event.target.errorCode));
    };
    req.onupgradeneeded = function (ev) {
      var traceStore = this.result.createObjectStore('traces', {
        keyPath: 'id',
        autoIncrement: true
      });
      traceStore.createIndex('module', 'module', { unique: false });
      traceStore.createIndex('step', 'step', { unique: false });
      traceStore.createIndex('type', 'type', { unique: false });
      traceStore.createIndex('complete', 'complete', { unique: false });
      traceStore.createIndex('time', 'time', { unique: false });
    };
  });
};

Api.addTrace = function (module, step, type, complete) {
  return new Promise(function (resolve, reject) {
    if (!db) {
      reject(Error('Database is not opened'));
    }
    var store = db.transaction('traces', 'readwrite').objectStore('traces');
    var req = store.add({
      module: module,
      step: step,
      type: type,
      complete: complete,
      time: new Date().toString()
    });
    req.onsuccess = resolve;
    req.onerror = function () {
      reject(Error(this.error));
    };
  });
};

module.exports = Api;
