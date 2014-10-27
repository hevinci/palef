var basePrototype = require('./base-prototype');
var statusPrototype = Object.create(basePrototype);

statusPrototype.createdCallback = function () {
  this.buildFromTemplate('module-status');
  var countParts = this.querySelectorAll('.count-box span');
  this.moduleTitle = this.querySelector('.title-box');
  this.currentStep = countParts[0];
  this.stepCount = countParts[1];
};

statusPrototype.showStatus = function (state) {
  this.moduleTitle.textContent = state.moduleTitle;
  this.currentStep.textContent = state.currentStep;
  this.stepCount.textContent = state.stepCount;
};

document.registerElement('module-status', { prototype: statusPrototype });
