var itemPrototype = Object.create(HTMLElement.prototype);

itemPrototype.createdCallback = function () {
  this.uid = null;
  this.type = 'single';
  this.input = null;
  this.label = null;
  this.text = null;
  this._build();
};

itemPrototype.selectedCallback = null;

itemPrototype.setData = function (data) {
  this.uid = data.uid;
  this.quizUid = data.quizUid;
  this.type = data.type || this.type;
  this._bind(data);
};

itemPrototype._build = function () {
  this.input = document.createElement('input');
  this.label = document.createElement('label');
  this.text = document.createTextNode('');
  this.input.onclick = this._onSelected.bind(this);
  var span = document.createElement('span');
  span.appendChild(this.text);
  this.label.appendChild(this.input);
  this.label.appendChild(span);
  this.appendChild(this.label);
};

itemPrototype._bind = function (data) {
  this.input.id = this.quizUid + '-' + this.uid;
  this.input.type = this.type === 'single' ? 'radio' : 'checkbox';
  this.input.name = 'quiz-' + this.quizUid;
  this.text.data = data.text;
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
