require('./nav-bar');
require('./module-list');
require('./module-status');
require('./module-controls');
require('./quiz-choice');

var Trace = require('./../trace');
var appPrototype = Object.create(HTMLElement.prototype);

appPrototype.createdCallback = function () {
  // tmp
  this.monitor = null;

  this.navBar = null;
  this.moduleStatus = null;
  this.moduleControls = null;
  this.container = null;
  this.moduleList = null;
  this.currentElement = null;
  this.defaultTitle = null;
  this._build();
};

appPrototype.traceCallback = null;

// tmp
appPrototype.setMonitor = function (monitor) {
  this.monitor = monitor;
};

appPrototype.listModules = function () {
  var self = this;

  self.monitor.getModuleList()
    .then(self.moduleList.setModules.bind(self.moduleList))
    .then(function () {
      self.moduleControls.hide();
      self.navBar.displayCenter(self.defaultTitle);
      self._switchTo(self.moduleList);
    })
    .catch(function (error) {
      console.error(error);
      throw error;
    });
};

appPrototype.displayStep = function (moduleId, stepId) {
  var step = this.monitor.getStep(moduleId, stepId);
  var moduleInfo = this.monitor.getModuleInfo(moduleId);

  this.moduleStatus.showStatus({
    moduleTitle: moduleInfo.title,
    stepCount: moduleInfo.stepCount,
    currentStep: stepId

  });
  this.moduleControls.showControls({
    moduleId: moduleId,
    previousStep: this.monitor.getPreviousStepId(moduleId, stepId),
    nextStep: this.monitor.getNextStepId(moduleId, stepId)
  });

  this.navBar.displayCenter(this.moduleStatus);
  this.navBar.displayRight(this.moduleControls);
  this._switchTo(this._resolveStep(step, moduleId, stepId));
};

appPrototype._build = function () {
  this.navBar = document.createElement('nav-bar');
  this.moduleStatus = document.createElement('module-status');
  this.moduleControls = document.createElement('module-controls');
  this.container = document.createElement('main');
  this.moduleList = document.createElement('module-list');
  this.defaultTitle = document.createTextNode('Palef');

  this.appendChild(this.navBar);
  this.appendChild(this.container);
};

appPrototype._switchTo = function (element) {
  if (this.currentElement !== element) {
    if (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }

    this.container.appendChild(element);
    this.currentElement = element;
  }
};

appPrototype._resolveStep = function (step, moduleId, stepId) {
  var self = this, view, trace;

  switch (step.type) {
    case 'text':
      view = document.createTextNode(step.data);
      trace = new Trace(moduleId, stepId, 'text', true);
      break;
    case 'video':
      var video = document.createElement('video');
      var source = document.createElement('source');
      video.controls = true;
      source.src = step.data.url;
      source.type = step.data.type;
      video.appendChild(source);
      view = video;
      trace = new Trace(moduleId, stepId, 'video', true);
      break;
    case 'quiz-choice':
      view = document.createElement('quiz-choice');
      view.setChallenge(step.data.challenge);
      view.validatedCallback = function () {
        var score = view.computeScore(step.data.solutions);
        self.monitor.recordTrace(
          new Trace(moduleId, stepId, 'quiz-choice', true, score)
        );
      };
      trace = new Trace(moduleId, stepId, 'quiz-choice', false);
      break;
    default:
      throw new Error('Unknown step type "' + step.type + '"');
  }

  this.monitor.recordTrace(trace);

  return view;
};

document.registerElement('app-palef', { prototype: appPrototype });