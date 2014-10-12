var navPrototype = Object.create(HTMLElement.prototype);

navPrototype.createdCallback = function () {
  this.moduleTitle = null;
  this.currentStep = null;
  this.stepCount = null;
  this.previousStep = null;
  this.nextStep = null;
  this._build();
};

navPrototype.showStepProgress = function (state) {
  this.moduleTitle.data = state.moduleTitle;
  this.currentStep.data = state.currentStep;
  this.stepCount.data = state.stepCount;
  this._updateStepControl(this.previousStep, state.moduleId, state.previousStep);
  this._updateStepControl(this.nextStep, state.moduleId, state.nextStep);
  this.style.display = 'inline';
};

navPrototype.hide = function () {
  this.style.display = 'none';
};

navPrototype._build = function () {
  var titleBox = document.createElement('span');
  var stepBox = document.createElement('span');
  var countBox = document.createElement('span');

  this.moduleTitle = document.createTextNode('');
  this.currentStep = document.createTextNode('');
  this.stepCount = document.createTextNode('');
  this.previousStep = document.createElement('a');
  this.nextStep = document.createElement('a');

  titleBox.className = 'title-box';
  stepBox.className = 'step-box';
  countBox.className = 'count-box';

  titleBox.appendChild(this.moduleTitle);
  stepBox.appendChild(this.currentStep);
  countBox.appendChild(this.stepCount);

  this.previousStep.appendChild(document.createTextNode('previous'));
  this.nextStep.appendChild(document.createTextNode('next'));

  this.appendChild(titleBox);
  this.appendChild(document.createTextNode('('));
  this.appendChild(stepBox);
  this.appendChild(document.createTextNode('/'));
  this.appendChild(countBox);
  this.appendChild(document.createTextNode(')'));
  this.appendChild(this.previousStep);
  this.appendChild(this.nextStep);
};

navPrototype._updateStepControl = function (control, moduleId, nextState) {
  if (nextState) {
    control.href = '#modules/' + moduleId + '/steps/' + nextState;
    control.style.display = 'inline';
  } else {
    control.style.display = 'none';
  }
};

document.registerElement('module-nav', { prototype: navPrototype });
