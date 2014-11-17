var helpers = require('./../../util/ui-helpers');

module.exports = function header() {
  var header = document.createElement('header');
  header.innerHTML = helpers.getTemplate('header');
  header._previous = header.querySelector('a.previous');
  header._next = header.querySelector('a.next');
  header._title = header.querySelector('h1');
  header.setArrowState = setArrowState.bind(header);
  header.setTitle = setTitle.bind(header);

  return header;
};

function setTitle(title) {
  this._title.textContent = title;
}

function setArrowState(state) {
  state = state || {};
  _changeArrowState(this._previous, state.previous);
  _changeArrowState(this._next, state.next);
}

function _changeArrowState(control, data) {
  if (!data) {
    control.href = '#';
    control.onclick = function (event) {
      event.preventDefault();
    };

    if (!control.classList.contains('disabled')) {
      control.classList.add('disabled');
    }
  } else {
    control.href = data;
    control.onclick = null;

    if (control.classList.contains('disabled')) {
      control.classList.remove('disabled');
    }
  }
}