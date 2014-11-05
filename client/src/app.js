var header = require('./component/header');
var modules = require('./component/modules');
var quizChoice = require('./component/quiz-choice');
var Trace = require('./trace');

function App(monitor) {
  this.monitor = monitor;
  this.header = header();
  this.modules = modules();
  this.footer = document.createElement('footer');
  this.container = document.createElement('div');
  this.container.className = 'wrapper';
  this.currentElement = this.modules;

  this.container.appendChild(this.header);
  this.container.appendChild(this.currentElement);
  document.body.appendChild(this.container);
  document.body.appendChild(this.footer);
}

App.prototype.displayHomepage = function () {
  var self = this;

  self.monitor.getModuleList()
    .then(function (modules) {
      document.body.className = 'home';
      self.header.setTitle('John Doe'); // tmp...
      self.modules.setList(modules);
      self._switchTo(self.modules);
    })
    .catch(function (error) {
      console.error(error);
      throw error;
    });
};

App.prototype.displayStep = function (moduleId, stepId) {
  var step = this.monitor.getStep(moduleId, stepId);
  var view = this._resolveStep(step, moduleId, stepId);

  var previous = this.monitor.getPreviousStepId(moduleId, stepId);
  var next = this.monitor.getNextStepId(moduleId, stepId);
  var baseRoute = '#/modules/' + moduleId + '/steps/';
  previous = previous ? (baseRoute + previous) : false;
  next = next ? (baseRoute + next) : false;

  this.header.setArrowState({ previous: previous, next: next });
  this.header.setTitle(step.title);

  this._switchTo(view);
};

App.prototype.refreshModuleList = function (modules) {
  this.modules.setList(modules);
};

App.prototype._switchTo = function (element) {
  if (this.currentElement !== element) {
    this.container.removeChild(this.currentElement);
    this.container.appendChild(element);
    this.currentElement = element;
  }
};

App.prototype._resolveStep = function (step, moduleId, stepId) {
  var self = this, view, trace;

  switch (step.type) {
    case 'chapter':
      document.body.className = 'chapter';
      view = document.createElement('main');
      view.innerHTML = step.data;
      trace = new Trace(moduleId, stepId, 'chapter', true);
      break;
    case 'quiz-choice':
      document.body.className = 'quiz';
      view = quizChoice(step.data.challenge);
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

module.exports = App;
