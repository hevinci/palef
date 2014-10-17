var statusPrototype = Object.create(HTMLElement.prototype);

statusPrototype.createdCallback = function () {
  this.moduleTitle = null;
  this.currentStep = null;
  this.stepCount = null;
  this._build();
};

statusPrototype.showStatus = function (state) {
  this.moduleTitle.data = state.moduleTitle;
  this.currentStep.data = state.currentStep;
  this.stepCount.data = state.stepCount;
};

statusPrototype._build = function () {
  var titleBox = document.createElement('span');
  var countBox = document.createElement('span');

  this.moduleTitle = document.createTextNode('');
  this.currentStep = document.createTextNode('');
  this.stepCount = document.createTextNode('');

  titleBox.className = 'title-box';
  countBox.className = 'count-box';
  titleBox.appendChild(this.moduleTitle);
  countBox.appendChild(document.createTextNode('('));
  countBox.appendChild(this.currentStep);
  countBox.appendChild(document.createTextNode('/'));
  countBox.appendChild(this.stepCount);
  countBox.appendChild(document.createTextNode(')'));

  this.appendChild(titleBox);
  this.appendChild(countBox);
};

document.registerElement('module-status', { prototype: statusPrototype });
