require('./module-info');

var listPrototype = Object.create(HTMLElement.prototype);

listPrototype.createdCallback = function () {
  this.modules = [];
};

listPrototype.setModules = function (modules) {
  this.modules = modules;

  while (this.firstChild) {
    this.removeChild(this.firstChild);
  }

  var fragment = document.createDocumentFragment();

  modules.forEach(function (module) {
    var info = document.createElement('module-info');
    info.setData({
      id: module.id,
      title: module.title,
      stepCount: module.stepCount,
      completedSteps: module.completedSteps
    });
    fragment.appendChild(info);
  }, this);

  this.appendChild(fragment);
};

document.registerElement('module-list', { prototype: listPrototype });
