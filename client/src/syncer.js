var Trace = require('./trace');

module.exports = Syncer;

/**
 * Constructs a syncer.
 *
 * @param {Database}  db
 * @param {Http}      http
 * @param {boolean}   debug
 * @constructor
 */
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
    (console.debug || console.log).bind(console) :
    function () {};
}

/**
 * Custom error thrown when and an synchronization attempt is made
 * while the syncer is in "locked" state (i.e. already performing
 * a synchronization).
 *
 * @type {SyncerLocked}
 */
Syncer.prototype.SyncerLocked = SyncerLocked;

/**
 * Callback executed when a synchronization has been successfully
 * performed (to be overridden by client code). It is called
 * with the progress response from the server.
 *
 * @type {function}
 */
Syncer.prototype.syncedCallback = function () {};

/**
 * Synchronizes an individual trace. If the trace cannot be sent
 * immediately to the server, it is saved in the local database
 * and a subsequent synchronization is scheduled.
 *
 * @param {Trace} trace
 * @returns {Promise}
 */
Syncer.prototype.syncTrace = function (trace) {
  var self = this;

  if (!(trace instanceof Trace)) {
    return Promise.reject(TypeError('Argument must be of type "Trace"'));
  }

  self.log('Received sync trace request');

  if (self.isLocked) {
    return self._onSyncTraceError(trace);
  }

  // apply a lock (prevent parallel sync requests)
  self.isLocked = true;

  return self.http.sendTraces([trace])
    .then(self._cacheServerProgress.bind(self))
    .then(self.db.open)
    .then(self._getCachedProgress.bind(self))
    .then(self.db.updateProgress)
    .then(self._getCachedProgress.bind(self))
    .then(function (progress) {
      self.log('Trace sent');
      self.isLocked = false;
      self.syncedCallback(progress);
    })
    .catch(function () {
      self.isLocked = false;

      return self._onSyncTraceError(trace);
    });
};

/**
 * Synchronizes every local data with the server. If the operation
 * fails, it will be periodically re-scheduled until it succeeds.
 *
 * @returns {Promise}
 */
Syncer.prototype.syncAll = function () {
  return this._doSyncAll();
};

Syncer.prototype._onSyncTraceError = function (trace) {
  var self = this;

  self.log('Cannot sync trace, saving and scheduling new sync');

  return self.db.open()
    .then(function () {
      return self.db.addTrace(trace);
    })
    .then(function () {
      return self.syncAll();
    });
};

// note: in order not to mess with internal schedule flags,
// always use the #syncAll function instead of this one.
Syncer.prototype._doSyncAll = function (isScheduled) {
  var self = this;

  self.log('Received sync all request');

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
      self.log('Rejected sync all request');

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
    .then(self._getCachedProgress.bind(self))
    .then(self.syncedCallback)
    .then(self._onSyncAllSuccess.bind(self))
    .catch(self._onSyncAllError.bind(self));
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

Syncer.prototype._onSyncAllSuccess = function () {
  this.log('Sync all request succeeded');
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

Syncer.prototype._onSyncAllError = function (error) {
  this.log('Sync all request failed');
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
