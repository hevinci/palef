/*
 * DAO
 *   #STORE
 *   #URL
 *   #create(object)
 *   #getLastSyncedTimestamp()
 *   #fetchUnsynced()
 *   #markAsSynced()
 */

function Persister(daos, http) {
  this.http = http;
  this.daos = daos;
  this.unsynced = [];
}

Persister.prototype.save = function (store, data) {
  data.synced = false;
  this.daos[store].create(data);
  this.unsynced[store].push(data);
  this.syncToServer();
};

Persister.prototype.fetchUnsynced = function () {
  this.daos.forEach(function (dao) {
    var unsynced = dao.fetchUnsynced();

    if (unsynced) {
      if (!this.unsynced[dao.STORE]) {
        this.unsynced[dao.STORE] = [];
      }

      this.unsynced[dao.STORE].push(unsynced);
    }
  });
};

Persister.prototype.syncToServer = function () {
  for (var store in this.unsynced) {
    if (this.unsynced[store].length > 0) {
      // unsynced data might be sent in chunks if needed (array slices)
      this.http.postAsJson(this.daos[store].URL, this.unsynced[store]);

      if (ok) {
        this.daos[store].markAsSynced(this.unsynced[store]);
        delete this.unsynced[store];
      }
    }
  }
};

Persister.prototype.syncFromServer = function () {
  this.daos.forEach(function (dao) {
    var lastSyncTimestamp = dao.getLastSyncTimestamp();
    var url = dao.URL + '?unsynced=true&from=' + lastSyncTimestamp;
    var unsynced = this.http.getJson(url);
    unsynced.forEach(function (data) {
      dao.create(data);
    });
  });
};
