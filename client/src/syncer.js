module.exports = Syncer;

function Syncer(db, http, debug) {
  this.db = db;
  this.http = http;
  this.isLocked = false;
  this.requestStack = 0;
  this.scheduleDelay = 2000;
  this.cachedTraceIds = null;
  this.cachedTraceValues = null;
  this.cachedProgress = null;
  this.log = debug ?
    console.debug.bind(console) :
    function () {};
}

Syncer.prototype.SyncerLocked = SyncerLocked;

Syncer.prototype.syncedCallback = null;

Syncer.prototype.syncAll = function () {
  return this._doSyncAll();
};

Syncer.prototype._doSyncAll = function (isScheduled) {
  var self = this;
  self.log('Received sync request');

  // keep track of sync requests, whether the syncer is locked or not
  self.requestStack++;

  // prevent starting parallel sync operations (as it would end up with
  // superfluous requests and/or duplicate data sent to the server)
  if (self.isLocked) {
    self.log('Syncer is locked');

    // operations that were scheduled internally are always allowed
    if (isScheduled) {
      self.log('Bypassed lock: operation was scheduled');
    } else {
      self.log('Rejected sync request');

      return Promise.reject(new SyncerLocked);
    }
  }

  // lock the syncer during operation
  self.isLocked = true;

  return self.db.open()
    .then(self.db.getTraces)
    .then(self._cacheCurrentTraces.bind(self))
    .then(self._getCachedTraceValues.bind(self))
    .then(self.http.sendTraces)
    .then(self._cacheServerProgress.bind(self))
    .then(self._getCachedTraceIds.bind(self))
    .then(self.db.removeTraces)
    .then(self._getCachedProgress.bind(self))
    .then(self.db.updateProgress)
    .then(self.syncedCallback || function () {})
    .then(self._onSuccess.bind(self))
    .catch(self._onError.bind(self));
};

Syncer.prototype._cacheCurrentTraces = function (traces) {
  this.cachedTraceIds = [];
  this.cachedTraceValues = [];
  traces.forEach(function (trace) {
    this.cachedTraceIds.push(trace.key);
    this.cachedTraceValues.push(trace.value);
  }, this);
};

Syncer.prototype._getCachedTraceIds = function () {
  return this.cachedTraceIds;
};

Syncer.prototype._getCachedTraceValues = function () {
  return this.cachedTraceValues;
};

Syncer.prototype._cacheServerProgress = function (progress) {
  this.cachedProgress = progress;
};

Syncer.prototype._getCachedProgress = function () {
  return this.cachedProgress;
};

Syncer.prototype._onSuccess = function () {
  this.log('Sync request succeeded');
  this.requestStack--;
  this._treatPendingRequests();
};

Syncer.prototype._treatPendingRequests = function () {
  if (this.requestStack === 0) {
    // no sync requests were made during the previous operation,
    // we can unlock for further requests
    this.isLocked = false;
  } else {
    // other requests are pending, a re-sync is needed
    this.log('Starting a re-sync for blocked attempts');
    this.requestStack = 0;
    this._doSyncAll(true);
  }
};

Syncer.prototype._onError = function (error) {
  this.log('Sync request failed');
  this.requestStack--;

  if (
    error instanceof this.http.NavigatorOffline ||
    error instanceof this.http.RequestFailure
  ) {
    // sync failed due to a network error, we must schedule another try
    this.log('Network failure: new attempt in ' + this.scheduleDelay);
    setTimeout(function () {
      this._doSyncAll(true);
    }.bind(this), this.scheduleDelay);
  } else {
    // tmp handler: execute pending requests and/or unlock
    this.log('Received error:', error);
    this._treatPendingRequests();
  }

  // always rethrow (promise rejection)
  throw error;
};

function SyncerLocked() {
  this.name = 'SyncerLocked';
  this.message = 'Syncer is currently locked (operation in progress)';
}

SyncerLocked.prototype = new Error();
SyncerLocked.prototype.constructor = SyncerLocked;
