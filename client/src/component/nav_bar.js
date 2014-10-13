var barPrototype = Object.create(HTMLElement.prototype);

barPrototype.createdCallback = function () {
  this.centerBox = null;
  this.rightBox = null;
  this.currentCenterElement = null;
  this._build();
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

barPrototype._build = function () {
  var homeLink = document.createElement('a');
  var homeIcon = document.createElement('span');

  this.centerBox = document.createElement('span');
  this.rightBox = document.createElement('span');
  this.centerBox.className = 'center-box';
  this.rightBox.className = 'right-box';

  homeLink.href = '#';
  homeLink.className = 'home-link';
  homeIcon.className = 'icon-list';
  homeLink.appendChild(homeIcon);

  this.appendChild(homeLink);
  this.appendChild(this.centerBox);
  this.appendChild(this.rightBox);
};

document.registerElement('nav-bar', { prototype: barPrototype });
