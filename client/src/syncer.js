module.exports = Syncer;

function Syncer(db, http) {
  this.db = db;
  this.http = http;
  this.isUnsynced = false;
}

Syncer.prototype.syncedCallback = null;

// key...?
Syncer.prototype.syncTrace = function (trace) {
  var self = this;

  if (this.isUnsynced) {
    return this.syncAll();
  }

  this.http.sendTraces([trace])
    .then(function (progress) {
      if (self.syncedCallback) {
        self.syncedCallback(progress);
      }
    })
    // remove...
    .catch(function (error) {
      self.isUnsynced = true;

      console.log(error);
    });
};

Syncer.prototype.syncAll = function () {
  var self = this, traceIds = [], traceValues = [], progress;

  self.db.open()
    .then(self.db.getTraces)
    .then(function (traces) {
      traces.forEach(function (trace) {
        traceIds.push(trace.key);
        traceValues.push(trace.value);
      });

      return traceValues;
    })
    .then(self.http.sendTraces)
    .then(function (serverProgress) {
      progress = serverProgress;

      //return self.db.updateProgress(progress);
    })
    .then(function () {
      if (self.syncedCallback) {
        self.syncedCallback(progress);
      }
    })
    .then(function () {
      return self.db.removeTraces(traceIds);
    })
    .catch(function (error) {
      if (error instanceof self.db.NoTraces) {
        console.log('No traces to sync');
      } else {
        self.isUnsynced = true;
        console.log(error);
      }
    });
};
