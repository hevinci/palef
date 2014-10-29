var basePrototype = require('./base-prototype');
var infoPrototype = Object.create(basePrototype);

infoPrototype.createdCallback = function () {
  this.buildFromTemplate('module-info');
  this.anchor = this.querySelector('a');
};

infoPrototype.setData = function (data) {
  this.anchor.href = '#modules/' + data.id;
  this.anchor.textContent = data.title +
    ' (' + data.completedSteps + '/' + data.stepCount + ')';
};

document.registerElement('module-info', { prototype: infoPrototype });
