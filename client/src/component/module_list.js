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
      var item = document.createElement('li');
      var anchor = document.createElement('a');
      anchor.href = '#modules/' + module.id;
      anchor.appendChild(document.createTextNode(module.title));
      item.appendChild(anchor);
      fragment.appendChild(item);
    });

    this.appendChild(fragment);
    this.isBound = true;
  }
};

document.registerElement('module-list', { prototype: listPrototype });
