module.exports = Syncer;

function Syncer(db, http) {
  this.db = db;
  this.http = http;
  this.isLocked = false;
  this.requestStack = 0;
  this.scheduleDelay = 2000;
}

Syncer.prototype.syncedCallback = null;

Syncer.prototype.syncAll = function () {
  var self = this;

  // keep track of sync requests, whether the syncer is locked or not
  self.requestStack++;

  // prevent starting parallel sync operations (as it would end up with
  // superfluous requests and/or duplicate data sent to the server)
  if (self.isLocked) {
    return Promise.reject(Error('Syncer is currently locked'));
  }

  // apply a lock
  self.isLocked = true;

  return self.db.open()
    .then(self.db.getTraces)
    .then(self._cacheCurrentTraces.bind(self))
    .then(self._getCachedTraceValues.bind(self))
    .then(self.http.sendTraces)
    .then(self.db.updateProgress)
    .then(self.syncedCallback || function () {})
    .then(self._getCachedTraceIds.bind(self))
    .then(self.db.removeTraces)
    .then(function () {
      // everything went ok
      self._end(false);
    })
    .catch(function (error) {
      if (
        error instanceof self.http.NavigatorOffline ||
        error instanceof self.http.RequestFailure
      ) {
        // sync failed due to network
        self._end(true);
      } else if (!error instanceof self.db.NoTraces) {
        // having no traces to sync isn't really an error,
        // but other errors must be rethrown
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
  }, this);
};

Syncer.prototype._getCachedTraceIds = function () {
  return this._cachedTraceIds;
};

Syncer.prototype._getCachedTraceValues = function () {
  return this._cachedTraceValues;
};

Syncer.prototype._end = function (hasError) {
  this.requestStack--;

  // unlocking for further requests
  this.isLocked = false;

  if (hasError) {
    // sync failed, we must schedule another try
    setTimeout(this.syncAll.bind(this), this.scheduleDelay);
  } else if (this.requestStack > 0) {
    // sync succeeded, but new requests were made during the previous
    // operation, we must re-sync immediately
    this.requestStack = 0;
    this.syncAll();
  }
};
