var helpers = require('./../util/ui-helpers');

module.exports = function modules() {
  var modules = document.createElement('main');
  modules.className = 'modules';
  modules.cardModel = document.createElement('a');
  modules.cardModel.href = '#';
  modules.cardModel.className = 'module-card';
  modules.cardModel.innerHTML = helpers.getTemplate('module-card');
  modules.setList = setList.bind(modules);

  return modules;
};

function setList(modules) {
  while (this.firstChild) {
    this.removeChild(this.firstChild);
  }

  modules.forEach(function (module) {
    var card = this.cardModel.cloneNode(true);
    card.href = '#/modules/' + module.id;
    card.querySelector('h2').textContent = module.title;
    card.querySelector('progress').value = module.completedSteps;
    card.querySelector('progress').max = module.stepCount;
    this.appendChild(card);
  }, this);
}
