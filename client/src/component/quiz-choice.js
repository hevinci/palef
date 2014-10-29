require('./quiz-item-text');

var basePrototype = require('./base-prototype');
var quizPrototype = Object.create(basePrototype);

quizPrototype.createdCallback = function () {
  this.buildFromTemplate('quiz-choice');
  this.uid = null;
  this.type = 'single';
  this.chosenItemUids = [];
  this.titleBox = this.querySelector('h3');
  this.itemContainer = this.querySelector('ul');
  this.button = this.querySelector('button');
  this.button.onclick = this._onValidate.bind(this);
  this.isBound = false;
};

quizPrototype.validatedCallback = null;

quizPrototype.setChallenge = function (challenge) {
  this.uid = challenge.uid;
  this.type = challenge.type;
  this._bind(challenge.title, challenge.items);
};

quizPrototype.computeScore = function (answers) {
  var score = 0;

  answers.filter(function (answer) {
    return this.chosenItemUids.indexOf(answer.uid) !== -1;
  }, this).forEach(function (answer) {
      score += answer.score;
  });

  return score;
};

quizPrototype._bind = function (title, items) {
  if (this.isBound) {
    while (this.itemContainer.firstChild) {
      this.itemContainer.removeChild(this.itemContainer.firstChild);
    }
  }

  this.titleBox.innerHTML = title;
  var fragment = document.createDocumentFragment();
  items.forEach(function (data) {
    var item = document.createElement('quiz-item-text');
    item.setData({
      uid: data.uid,
      quizUid: this.uid,
      type: this.type,
      text: data.text
    });
    item.selectedCallback = this._onItemSelected.bind(this);
    fragment.appendChild(item);
  }, this);

  this.itemContainer.appendChild(fragment);
  this.isBound = true;
};

quizPrototype._onItemSelected = function (itemUid, isSelected) {
  var itemIndex = this.chosenItemUids.indexOf(itemUid);
  var hasAlreadyItems = this.chosenItemUids.length > 0;

  if (isSelected) {
    if (this.type === 'single') {
      this.chosenItemUids = [itemUid];
    } else if (itemIndex < 0) {
      this.chosenItemUids.push(itemUid);
    }
  } else if (itemIndex >= 0) {
    this.chosenItemUids.splice(itemIndex, 1);
  }

  if (this.chosenItemUids.length === 0) {
    this.button.disabled = true;
  } else if (!hasAlreadyItems) {
    this.button.disabled = false;
  }
};

quizPrototype._onValidate = function () {
  if (typeof this.validatedCallback) {
    this.validatedCallback();
  }
};

document.registerElement('quiz-choice', { prototype: quizPrototype });
