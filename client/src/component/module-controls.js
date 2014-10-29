var basePrototype = require('./base-prototype');
var controlsPrototype = Object.create(basePrototype);

controlsPrototype.createdCallback = function () {
  this.buildFromTemplate('module-controls');
  var controls = this.querySelectorAll('a');
  this.previousStep = controls[0];
  this.nextStep = controls[1];
};

controlsPrototype.showControls = function (state) {
  this._updateControl(this.previousStep, state.moduleId, state.previousStep);
  this._updateControl(this.nextStep, state.moduleId, state.nextStep);
  this.className = '';
};

controlsPrototype.hide = function () {
  this.className = 'invisible';
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
