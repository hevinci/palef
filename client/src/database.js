require('es6-promise').polyfill();

// TMP
var db = null;
var Api = {};

function Database(name, stores) {
  this.name = name || 'default';
  this.stores = stores || [];
  this.connection = null;
  this.isClosed = true;
}

// TMP
Api.Database = Database;

Database.prototype.open = function () {
  var self = this;

  return new Promise(function (resolve, reject) {
    var request;

    if (self.connection) {
      return resolve(self.connection);
    }

    request = indexedDB.open(self.name, 1);

    request.onsuccess = function () {
      self.connection = this.result;
      self.isClosed = false;
      resolve(self.connection);
    };

    request.onerror = function (event) {
      reject(Error(event.target.errorCode));
    };

    request.onupgradeneeded = function () {
      createStores(this.result, self.stores);
    };
  });
};

Database.prototype.destroy = function () {
  var self = this;

  return new Promise(function (resolve, reject) {
    var request;

    if (!self.connection) {
      return resolve(Error('Cannot destroy db: no connection opened'));
    }

    if (!self.isClosed) {
      self.connection.close();
      self.isClosed = true;

      // Although it acts asynchronously, the specification doesn't define
      // any event handler on the #close() method. Therefore, delaying the
      // call to #deleteDatabase seems the only way of getting rid of
      // "request blocked" errors.
      setTimeout(function () {
        request = indexedDB.deleteDatabase(self.name);

        request.onsuccess = function () {
          self.connection = null;
          resolve();
        };

        request.onerror = function (event) {
          reject(Error(event.target.errorCode));
        };

        request.onblocked = function (event) {
          console.log('block', Date.now(), event)

          var msg = 'Cannot destroy db "'
            + self.name + '":'
            + ' request has been blocked';
          reject(Error(msg));
        };
      }, 20);
    }
  });
};

Database.prototype.add = function (store, data) {
  var self = this;

  return new Promise(function (resolve, reject) {
    var objectStore, request;

    if (!self.connection) {
      reject(Error('Database is not opened'));
    }

    objectStore = self.connection.transaction(store, 'readwrite')
      .objectStore(store);

    request = objectStore.add(data);

    request.onsuccess = function () {
      resolve();
    };

    request.onerror = function () {
      var msg = 'Cannot add object ('
        + this.error.name + ': '
        + this.error.message + ')';
      reject(Error(msg));
    };
  });
};

function createStores(db, stores) {
  stores.forEach(function (store) {
    var objectStore = db.createObjectStore(store.name, {
      keyPath: store.keyPath,
      autoIncrement: store.autoIncrement
    });

    if (store.indexes) {
      store.indexes.forEach(function (index) {
        objectStore.createIndex(
          index.field,
          index.name || index.field,
          { unique: index.unique }
        );
      });
    }
  });
}


/*********************************
 *             TMP               *
 *********************************/


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
    req.onupgradeneeded = function () {
      var traceStore = this.result.createObjectStore('traces', {
        keyPath: 'id',
        autoIncrement: true
      });
      var progressStore = this.result.createObjectStore('progress', {
        keyPath: 'id',
        autoIncrement: true
      });
      traceStore.createIndex('module', 'module', { unique: false });
      traceStore.createIndex('step', 'step', { unique: false });
      traceStore.createIndex('type', 'type', { unique: false });
      traceStore.createIndex('complete', 'complete', { unique: false });
      traceStore.createIndex('time', 'time', { unique: false });
      progressStore.createIndex('module', 'module', { unique: true });
      progressStore.createIndex('progress', 'progress', { unique: false });
    };
  });
};

Api.addTrace = function (module, step, type, complete) {
  return new Promise(function (resolve, reject) {
    if (!db) {
      reject(Error('Database is not opened'));
    }
    var store = db.transaction('traces', 'readwrite')
      .objectStore('traces');
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

Api.updateProgress = function (module, progress) {
  return new Promise(function (resolve, reject) {
    if (!db) {
      reject(Error('Database is not opened'));
    }
    var store = db.transaction('progress', 'readwrite')
      .objectStore('progress');
    var req = store.add({
      module: module,
      progress: progress,
    });
    req.onsuccess = resolve;
    req.onerror = function () {
      reject(Error(this.error));
    };
  });
};

module.exports = Api;
