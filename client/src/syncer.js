module.exports = Syncer;

function Syncer(db, http) {
  this.db = db;
  this.http = http;
  this.isLocked = false;
  this.requestCount = 0;
  this.scheduleDelay = 2000;
}

Syncer.prototype.syncedCallback = null;

Syncer.prototype.syncAll = function () {
  var self = this;

  // keep track of sync requests, whether the syncer is locked or not
  self.requestCount++;

  // prevent starting parallel sync operations (as it would end up with
  // superfluous requests and/or duplicate data sent to the server)
  if (self.isLocked) {
    return;
  }

  // apply a lock
  self.isLocked = true;

  self.db.open()
    .then(self.db.getTraces)
    .then(self._cacheCurrentTraces)
    .then(self._getCachedTraceValues)
    .then(self.http.sendTraces)
    .then(self._cacheServerProgress)
    .then(self.db.updateProgress)
    .then(self._getCachedProgress)
    .then(self.syncedCallback || function () {})
    .then(self._getCachedTraceIds)
    .then(self.db.removeTraces)
    .then(function () {
      // sync complete: unlocking for further requests
      self.isLocked = false;
      self.requestCount--;

      // if new requests were made during the previous operation,
      // we must re-sync immediately
      if (self.requestCount > 0) {
        self.requestCount = 0;
        self.syncAll();
      }
    })
    .catch(function (error) {
      if (error instanceof self.db.NoTraces) {
        console.log('No traces to sync');
      } else if (
        error instanceof self.http.NavigatorOffline ||
        error instanceof self.http.RequestFailure
      ) {
        // sync failed, we must schedule another try
        self.isLocked = false;
        setTimeout(self.syncAll.bind(self), self.scheduleDelay);
      } else {
        throw error;
      }
    });
};

Syncer.prototype._cacheCurrentTraces = function (traces) {
  this._cachedTraceIds = [];
  this._cachedTraceValues = [];
  traces.forEach(function (trace) {
    this._cachedTraceIds.push(trace.key);
    this._cachedTraceValues.push(trace.value);
  });
};

Syncer.prototype._getCachedTraceIds = function () {
  return this._cachedTraceIds;
};

Syncer.prototype._getCachedTraceValues = function () {
  return this._cachedTraceValues;
};

Syncer.prototype._cacheServerProgress = function (progress) {
  this._cachedProgress = progress;
};

Syncer.prototype._getCachedProgress = function () {
  return this._cachedProgress;
};
