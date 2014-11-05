var helpers = require('./../util/ui-helpers');

module.exports = function quizItem(options) {
  var item = document.createElement('li');

  item.uid = options.uid;
  item.type = options.type;
  item.selectedCallback = null;

  item.innerHTML = helpers.getTemplate('quiz-item-text');
  item.input = item.querySelector('input');
  item.input.id = options.quizUid + '-' + options.uid;
  item.input.type = options.type === 'single' ? 'radio' : 'checkbox';
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
