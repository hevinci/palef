var basePrototype = require('./base-prototype');
var itemPrototype = Object.create(basePrototype);

itemPrototype.createdCallback = function () {
  this.buildFromTemplate('quiz-item-text');
  this.uid = null;
  this.type = 'single';
  this.label = this.querySelector('label');
  this.text = this.querySelector('span');
  this.input = this.querySelector('input');
  this.input.onclick = this._onSelected.bind(this);
};

itemPrototype.selectedCallback = null;

itemPrototype.setData = function (data) {
  this.uid = data.uid;
  this.quizUid = data.quizUid;
  this.type = data.type || this.type;
  this._bind(data);
};

itemPrototype._bind = function (data) {
  this.input.id = this.quizUid + '-' + this.uid;
  this.input.type = this.type === 'single' ? 'radio' : 'checkbox';
  this.input.name = 'quiz-' + this.quizUid;
  this.text.textContent = data.text;
  this.label.htmlFor = this.input.id;
};

itemPrototype._onSelected = function (event) {
  var isSelected = true;

  if (this.type !== 'single' && !event.target.checked) {
    isSelected = false;
  }

  if (typeof this.selectedCallback === 'function') {
    this.selectedCallback(this.uid, isSelected);
  }
};

document.registerElement('quiz-item-text', { prototype: itemPrototype });
