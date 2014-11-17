require('es6-promise').polyfill();

var Trace = require('./trace');
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
      this.result.createObjectStore('stats');
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
      reject(Error('Error while deleting db: ' + event.target.errorCode));
    };
    request.onblocked = function () {
      reject(Error(
        'Cannot destroy db "' + name + '": request has been blocked'
      ));
    };
  });
};

db.addTrace = function (trace) {
  if (!(trace instanceof Trace)) {
    return Promise.reject(TypeError('Argument must be of type "Trace"'));
  }

  return writeTransaction('traces', function (store) {
    store.add(trace);
  });
};

db.getTraces = function () {
  return readAllTransaction('traces');
};

db.removeTraces = function (keys) {
  if (keys.length === 0) {
    return Promise.resolve();
  }

  return writeTransaction('traces', function (store) {
    keys.forEach(function (key) {
      store.delete(key);
    });
  });
};

db.getProgress = function () {
  return readAllTransaction('stats')
    .then(function (stats) {
      if (stats && stats[0]) {
        return stats[0].value;
      }

      return null;
    });
};

db.updateProgress = function (progress) {
  return writeTransaction('stats', function (store) {
    store.put(progress, 'progress');
  });
};

function writeTransaction(storeName, operation) {
  return new Promise(function (resolve, reject) {
    var transaction, store;

    if (!connection) {
      return reject(Error('Database is not opened'));
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

function readAllTransaction(storeName) {
  return new Promise(function (resolve, reject) {
    var transaction, store, request;
    var records = [];

    if (!connection) {
      return reject(Error('Database is not opened'));
    }

    transaction = connection.transaction(storeName, 'readonly');
    store = transaction.objectStore(storeName);
    request = store.openCursor();
    request.onsuccess = function () {
      var cursor = request.result;

      if (cursor) {
        records.push({
          key: cursor.key,
          value: cursor.value
        });
        cursor.continue();
      } else {
        resolve(records);
      }
    };
    transaction.onabort = function () {
      reject(this.error);
    };
    transaction.onerror = function () {
      reject(this.error);
    };
  });
}
