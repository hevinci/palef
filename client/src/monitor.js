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
  var self = this;

  if (!(trace instanceof Trace)) {
    throw new TypeError('Argument must be of type "Trace"');
  }

  return self.getModuleList()
    .then(function (modules) {
      // re-compute stats and save them locally (needed if we're offline)
      modules.forEach(function (module) {
        module.score = module.max !== null ? 0 : null;
        module.completedSteps = 0;

        module.steps.forEach(function (step) {
          if (module.id === trace.module && step.id === trace.step) {
            step.complete = step.complete || trace.complete;

            if (trace.score !== null && trace.score > step.score) {
              step.score = trace.score;
            }
          }

          if (step.complete) {
            module.completedSteps++;
          }

          if (step.score !== null) {
            module.score += step.score;
          }
        });
      });

      return self.db.updateProgress({ 'modules': modules });
    })
    .then(function () {
      // try to sync trace with server
      return self.syncer.syncTrace(trace);
    });
};

Monitor.prototype._buildEmptyModuleStats = function () {
  var moduleStats = [];

  // should be shared with server side...
  modules.forEach(function (module) {
    var moduleScore = null, moduleMax = null;
    var steps = module.steps.map(function (step) {
      var score = null, max = null;

      if (step.type === 'quiz-choice') {
        moduleScore = moduleScore === null ? 0 : moduleScore;
        moduleMax = moduleMax === null ? 0 : moduleMax;
        score = 0;
        max = 0;

        if (step.data.challenge.type === 'multiple') {
          step.data.solutions.forEach(function (solution) {
            max += solution.score;
            moduleMax += solution.score;
          });
        } else if (step.data.challenge.type === 'single') {
          max = step.data.solutions.reduce(function (prev, curr) {
            return curr.score > prev ? curr.score : prev;
          }, 0);
          moduleMax += max;
        }
      }

      return {
        id: step.id,
        complete: false,
        score: score,
        max: max
      };
    });

    moduleStats.push({
      id: module.id,
      title: module.title,
      stepCount: module.steps.length,
      completedSteps: 0,
      score: moduleScore,
      max: moduleMax,
      steps: steps
    });
  });

  return moduleStats;
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
