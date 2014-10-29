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

  this.modules = [];
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

// tmp
appPrototype.setModules = function (modules) {
  this.modules = modules;
};

appPrototype.listModules = function () {
  this.moduleControls.hide();
  this.moduleList.setModules(this.modules);
  this.navBar.displayCenter(this.defaultTitle);
  this._switchTo(this.moduleList);
};

appPrototype.displayStep = function (moduleId, stepId) {
  var stepData = this.modules[moduleId - 1].steps[stepId - 1];
  var stepCount = this.modules[moduleId - 1].steps.length;

  this.moduleStatus.showStatus({
    moduleTitle: this.modules[moduleId - 1].title,
    currentStep: stepId,
    stepCount: this.modules[moduleId - 1].steps.length

  });
  this.moduleControls.showControls({
    moduleId: moduleId,
    previousStep: stepId > 1 ? stepId - 1 : false,
    nextStep: stepCount > stepId ? stepId + 1 : false
  });

  this.navBar.displayCenter(this.moduleStatus);
  this.navBar.displayRight(this.moduleControls);
  this._switchTo(this._resolveStep(stepData, moduleId, stepId));
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
      trace = new Trace(moduleId, stepId, 'text');
      break;
    case 'video':
      var video = document.createElement('video');
      var source = document.createElement('source');
      video.controls = true;
      source.src = step.data.url;
      source.type = step.data.type;
      video.appendChild(source);
      view = video;
      trace = new Trace(moduleId, stepId, 'video');
      break;
    case 'quiz-choice':
      view = document.createElement('quiz-choice');
      view.setChallenge(step.data.challenge);
      view.validatedCallback = function () {
        var score = view.computeScore(step.data.solutions);
        self.monitor.recordTrace(
          new Trace (moduleId, stepId, 'quiz-choice', score)
        );
      };
      break;
    default:
      throw new Error('Unknown step type "' + step.type + '"');
  }

  if (trace) {
    this.monitor.recordTrace(trace);
  }

  return view;
};

appPrototype._saveTrace = function (moduleId, stepId, type, score) {
  this.monitor.recordTrace(new Trace(moduleId, stepId, type, score));
};

document.registerElement('app-palef', { prototype: appPrototype });