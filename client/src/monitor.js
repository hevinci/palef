Trace = require('./trace');

module.exports = Monitor;

function Monitor(syncer, db, modules) {
  this.syncer = syncer;
  this.db = db;
  this.modules = modules;
  this.cachedStats = null;
}

Monitor.prototype.onServerProgress = function (progress) {
  if (!progress) {
    // cannot throw... (called inside syncer promise)
    console.error('Did not receive progress from server');
  } else {
    this.cachedStats = progress.modules;
  }
};

Monitor.prototype.getModuleList = function () {
  var self = this;

  if (!this.cachedStats) {
    return self.db.open()
      .then(self.db.getProgress)
      .then(function (progress) {
        return self.cachedStats = progress ?
          progress.modules :
          self._buildEmptyModuleStats();
      });
  }

  return Promise.resolve(self.cachedStats);
};

Monitor.prototype.getModuleInfo = function (moduleId) {
  var module = this._findModule(moduleId);

  return {
    title: module.title,
    stepCount: module.steps.length
  }
};

Monitor.prototype.getStep = function (moduleId, stepId) {
  var module = this._findModule(moduleId);
  var stepIndex = this._getStepIndex(module, stepId);

  return module.steps[stepIndex];
};

Monitor.prototype.getPreviousStepId = function (moduleId, currentStepId) {
  return this._findCloseStep(moduleId, currentStepId, true);
};

Monitor.prototype.getNextStepId = function (moduleId, currentStepId) {
  return this._findCloseStep(moduleId, currentStepId, false);
};

Monitor.prototype.recordTrace = function (trace) {
  if (!(trace instanceof Trace)) {
    throw new TypeError('Argument must be of type "Trace"');
  }

  return this.syncer.syncTrace(trace);
};

Monitor.prototype._buildEmptyModuleStats = function () {
  var stats = [];

  this.modules.forEach(function (module) {
    stats.push({
      id: module.id,
      title: module.title,
      stepCount: module.steps.length,
      completedSteps: 0,
      steps: module.steps.map(function (step) {
        return {
          id: step.id,
          complete: false,
          score: null
        };
      })
    });
  }, this);

  return stats;
};

Monitor.prototype._findCloseStep = function (moduleId, stepId, isBefore) {
  var module = this._findModule(moduleId);
  var stepIndex = this._getStepIndex(module, stepId);
  var targetIndex = isBefore ? stepIndex - 1 : stepIndex + 1;
  var targetId = null;

  if (module.steps[targetIndex]) {
    targetId =  module.steps[targetIndex].id;
  }

  return targetId;
};

Monitor.prototype._findModule = function (id) {
  for (var i = 0, max = this.modules.length; i < max; ++i) {
    if (this.modules[i].id === id) {
      return this.modules[i];
    }
  }

  throw new Error('Cannot find module "' + id + '"');
};

Monitor.prototype._getStepIndex = function (module, stepId) {
  for (var i = 0, max = module.steps.length; i < max; ++i) {
    if (module.steps[i].id === stepId) {
      return i;
    }
  }

  throw new Error('Cannot find step "' + stepId + '"');
};
