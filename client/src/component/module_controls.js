var controlsPrototype = Object.create(HTMLElement.prototype);

controlsPrototype.createdCallback = function () {
  this.previousStep = null;
  this.nextStep = null;
  this._build();
};

controlsPrototype.showControls = function (state) {
  this._updateControl(this.previousStep, state.moduleId, state.previousStep);
  this._updateControl(this.nextStep, state.moduleId, state.nextStep);
  this.className = '';
};

controlsPrototype.hide = function () {
  this.className = 'invisible';
};

controlsPrototype._build = function () {
  var leftIcon = document.createElement('span');
  var rightIcon = document.createElement('span');

  this.previousStep = document.createElement('a');
  this.nextStep = document.createElement('a');

  leftIcon.className = 'icon-arrow-left';
  rightIcon.className = 'icon-arrow-right';

  this.previousStep.appendChild(leftIcon);
  this.nextStep.appendChild(rightIcon);
  this.appendChild(this.previousStep);
  this.appendChild(this.nextStep);
};

controlsPrototype._updateControl = function (control, moduleId, nextState) {
  if (nextState) {
    control.href = '#modules/' + moduleId + '/steps/' + nextState;
    control.className = '';
  } else {
    control.className = 'hidden';
  }
};

document.registerElement('module-controls', { prototype: controlsPrototype });
