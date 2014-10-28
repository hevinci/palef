module.exports = Monitor;

function Monitor(syncer, db, modules) {
  this.syncer = syncer;
  this.db = db;
  this.modules = modules;
}

Monitor.prototype.recordTrace = function (trace) {
  return this.syncer.syncTrace(trace);
};

Monitor.prototype.previousStepId = function (moduleId, currentStepId) {
  return this._findCloseStep(moduleId, currentStepId, true);
};

Monitor.prototype.nextStepId = function (moduleId, currentStepId) {
  return this._findCloseStep(moduleId, currentStepId, false);
};

Monitor.prototype.getProgress = function (moduleId) {

};

Monitor.prototype.computeProgress = function (newTrace) {

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
