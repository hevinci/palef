var db = require('./../database');
var ChoiceHandler = require('./../quiz/handler/choice');

function ModulePlayer(element, modules) {
  this.el = element;
  this.modules = modules;
}

ModulePlayer.prototype.list = function () {
  this.el.innerHTML = Templates['modules'](this.modules);
};

ModulePlayer.prototype.showStep = function (moduleId, stepId) {
  while (this.el.firstChild) {
    this.el.removeChild(this.el.firstChild)
  }

  var stepCount = this.modules[moduleId - 1].steps.length;
  var previousStep = stepId > 1 ? stepId - 1 : false;
  var nextStep = stepCount > stepId ? stepId + 1 : false;

  var fragment = document.createElement('div');
  fragment.innerHTML = Templates['step']({
    moduleId: moduleId,
    moduleTitle: this.modules[moduleId - 1].title,
    currentStep: stepId,
    previousStep: previousStep,
    nextStep: nextStep,
    stepCount: stepCount
  });
  var contentEl = fragment.querySelector('.step-content');
  var step = this.modules[moduleId - 1].steps[stepId - 1];
  var container = this.el;

  if (step.type === 'text') {
    contentEl.innerHTML = step.data;
    container.appendChild(fragment);
    saveTrace(moduleId, stepId, 'text', true);
  } else if (step.type === 'quiz') {
    var player = new ChoiceHandler(contentEl, {
      rendered: function () {
        container.appendChild(fragment)
      },
      succeeded: function () {
        saveTrace(moduleId, stepId, 'quiz', true);
      },
      failed: function () {
        saveTrace(moduleId, stepId, 'quiz', false);
      }
    });
    player.startChallenge(step.data.challenge);
  } else {
    throw new Error('Unknown step type: ' + step.type);
  }
};

function saveTrace(moduleId, stepId, type, completed) {
  db.open().then(function () {
    db.addTrace(moduleId, stepId, type, completed);
  }).catch(function (err) {
    console.error(err);
  });
}

module.exports = ModulePlayer;