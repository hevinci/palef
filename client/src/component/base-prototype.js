var basePrototype = module.exports = Object.create(HTMLElement.prototype);
var templates = window.Templates || {};

basePrototype.buildFromTemplate = function (id) {
  if (!templates[id]) {
    throw new Error('Unknown template "' + id + '"');
  }

  this.innerHTML = templates[id];
};
