var helpers = require('./../../util/ui-helpers');
var quizItem = require('./quiz-item');

function quizChoice(challenge) {
  var quiz = document.createElement('main');

  quiz.isBound = false;
  quiz.chosenItemUids = [];
  quiz.validatedCallback = null;

  quiz.innerHTML = helpers.getTemplate('quiz-choice');
  quiz.itemContainer = quiz.querySelector('ul');
  quiz.button = quiz.querySelector('.icon-tick');
  quiz.button.onclick = _onValidate.bind(quiz);

  quiz.setChallenge = setChallenge.bind(quiz);
  quiz.computeScore = computeScore.bind(quiz);

  quiz.setChallenge(challenge);

  return quiz;
}

function setChallenge(challenge) {
  this.uid = challenge.uid;
  this.type = challenge.type;

  if (this.isBound) {
    while (this.itemContainer.firstChild) {
      this.itemContainer.removeChild(this.itemContainer.firstChild);
    }
  }

  var fragment = document.createDocumentFragment();
  challenge.items.forEach(function (item) {
    var item = quizItem({
      uid: item.uid,
      quizUid: challenge.uid,
      type: challenge.type,
      text: item.text
    });
    item.selectedCallback = _onItemSelected.bind(this);
    fragment.appendChild(item);
  }, this);

  this.itemContainer.appendChild(fragment);
  this.isBound = true;
}

function computeScore(answers) {
  var score = 0;

  answers.filter(function (answer) {
    return this.chosenItemUids.indexOf(answer.uid) !== -1;
  }, this).forEach(function (answer) {
    score += answer.score;
  });

  return score;
}

function _onItemSelected(itemUid, isSelected) {
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
    this.button.classList.add('disabled');
  } else if (!hasAlreadyItems) {
    this.button.classList.remove('disabled');
  }
}

function _onValidate() {
  if (this.validatedCallback && !this.button.classList.contains('disabled')) {
    this.validatedCallback();
  }
}

module.exports = quizChoice;
