require('es6-promise').polyfill();

var db = module.exports = {};
var connection = null;

db.open = function (name) {
  return new Promise(function (resolve, reject) {
    var request;

    if (connection) {
      return resolve(connection);
    }

    request = indexedDB.open(name || 'palef', 1);
    request.onsuccess = function () {
      connection = this.result;
      resolve(connection);
    };
    request.onerror = function (event) {
      reject(Error('Db open request error: ' + event.target.errorCode));
    };
    request.onblocked = function () {
      reject(Error('Cannot open db: request is blocked'));
    };
    request.onupgradeneeded = function () {
      this.result.createObjectStore('traces', { autoIncrement: true });
      this.result.createObjectStore('progress', { keyPath: 'moduleId' });
    };
  });
};

db.destroy = function (name) {
  name = name || 'palef';

  return new Promise(function (resolve, reject) {
    var request;

    if (!connection) {
      return resolve(Error('Cannot destroy db: no connection opened'));
    }

    connection.close();
    request = indexedDB.deleteDatabase(name);
    request.onsuccess = function () {
      connection = null;
      resolve();
    };
    request.onerror = function (event) {
      reject(Error(
          'Error while deleting db: ' + event.target.errorCode
      ));
    };
    request.onblocked = function () {
      reject(Error(
          'Cannot destroy db "' + name + '": request has been blocked'
      ));
    };
  });
};

db.addTrace = function (module, step, type, complete) {
  return writeTransaction('traces', function (store) {
    store.add({
      module: module,
      step: step,
      type: type,
      complete: complete,
      time: Date.now()
    });
  });
};

db.getTraces = function () {
  return new Promise(function (resolve, reject) {
    var transaction, store, request;
    var traces = [];

    if (!connection) {
      reject(Error('Database is not opened'));
    }

    transaction = connection.transaction('traces', 'readonly');
    store = transaction.objectStore('traces');
    request = store.openCursor();
    request.onsuccess = function () {
      var cursor = request.result;

      if (cursor) {
        traces.push({
          key: cursor.key,
          value: cursor.value
        });
        cursor.continue();
      } else {
        resolve(traces);
      }
    };
  });
};

db.removeTraces = function (keys) {
  return writeTransaction('traces', function (store) {
    keys.forEach(function (key) {
      store.delete(key);
    });
  });
};

function writeTransaction(storeName, operation) {
  return new Promise(function (resolve, reject) {
    var transaction, store;

    if (!connection) {
      reject(Error('Database is not opened'));
    }

    transaction = connection.transaction(storeName, 'readwrite');
    store = transaction.objectStore(storeName);
    operation(store);
    transaction.oncomplete = function () {
      resolve();
    };
    transaction.onabort = function () {
      reject(this.error);
    };
    transaction.onerror = function () {
      reject(this.error);
    };
  });
}
