require('./nav_bar');
require('./module_list');
require('./module_status');
require('./module_controls');
require('./quiz_choice');

var db = require('./../database');

var appPrototype = Object.create(HTMLElement.prototype);

appPrototype.createdCallback = function () {
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
  if (step.type === 'text') {
    saveTrace(moduleId, stepId, 'text', true);

    return document.createTextNode(step.data);
  }

  if (step.type === 'quiz-choice') {
    var quiz = document.createElement('quiz-choice');
    quiz.setChallenge(step.data.challenge);
    quiz.validatedCallback = function () {
      var score = quiz.computeScore(step.data.solutions);
      saveTrace(moduleId, stepId, 'quiz-choice', score);
    };
    return quiz;
  }

  throw new Error('Unknown step type "' + step.type + '"');
};

function saveTrace(moduleId, stepId, type, completed) {
  db.open().then(function () {
    db.addTrace(moduleId, stepId, type, completed);
  }).catch(function (err) {
      console.error(err);
  });
}

document.registerElement('app-palef', { prototype: appPrototype });