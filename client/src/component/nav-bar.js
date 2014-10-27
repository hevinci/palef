var basePrototype = require('./base-prototype');
var barPrototype = Object.create(basePrototype);

barPrototype.createdCallback = function () {
  this.buildFromTemplate('nav-bar');
  this.centerBox = this.querySelector('.center-box');
  this.rightBox = this.querySelector('.right-box');
  this.currentCenterElement = null;
};

barPrototype.displayCenter = function (element) {
  if (element !== this.currentCenterElement) {
    if (this.currentCenterElement) {
      this.centerBox.removeChild(this.currentCenterElement);
    }

    this.centerBox.appendChild(element);
    this.currentCenterElement = element;
  }
};

barPrototype.displayRight = function (element) {
  this.rightBox.appendChild(element);
};

document.registerElement('nav-bar', { prototype: barPrototype });
