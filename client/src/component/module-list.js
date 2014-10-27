require('./module-info');

var listPrototype = Object.create(HTMLElement.prototype);

listPrototype.createdCallback = function () {
  this.modules = [];
  this.isBound = false;
};

listPrototype.setModules = function (modules) {
  this.modules = modules;

  if (!this.isBound || modules.length !== this.modules.length) {
    var fragment = document.createDocumentFragment();

    modules.forEach(function (module) {
      var info = document.createElement('module-info');
      info.setData({
        id: module.id,
        title: module.title,
        progress: module.progress
      });
      fragment.appendChild(info);
    }, this);

    this.appendChild(fragment);
    this.isBound = true;
  }
};

document.registerElement('module-list', { prototype: listPrototype });
