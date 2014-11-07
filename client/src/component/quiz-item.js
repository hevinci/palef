var helpers = require('./../util/ui-helpers');

module.exports = function quizItem(options) {
  var item = document.createElement('li');

  item.uid = options.uid;
  item.quizType = options.type || 'multiple';
  item.selectedCallback = null;

  item.innerHTML = helpers.getTemplate('quiz-item');
  item.input = item.querySelector('input');
  item.input.id = options.quizUid + '-' + options.uid;
  item.input.type = item.quizType === 'single' ? 'radio' : 'checkbox';
  item.input.name = 'quiz-' + options.quizUid;
  item.input.onclick = _onSelected.bind(item);
  item.querySelector('label').htmlFor = item.input.id;
  item.querySelector('span').textContent = options.text;

  return item;
};

function _onSelected(event) {
  var isSelected = true;

  if (this.type !== 'single' && !event.target.checked) {
    isSelected = false;
  }

  if (typeof this.selectedCallback === 'function') {
    this.selectedCallback(this.uid, isSelected);
  }
}
