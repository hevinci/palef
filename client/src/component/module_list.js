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
      fragment.appendChild(this._buildModuleInfo({
        id: module.id,
        title: module.title,
        progress: module.progress
      }));
    }, this);

    this.appendChild(fragment);
    this.isBound = true;
  }
};

listPrototype._buildModuleInfo = function (info) {
  var item = document.createElement('li');
  var anchor = document.createElement('a');
  anchor.href = '#modules/' + info.id;
  anchor.appendChild(document.createTextNode(info.title));
  item.appendChild(anchor);

  return item;
};

document.registerElement('module-list', { prototype: listPrototype });
