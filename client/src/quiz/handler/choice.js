function ChoiceHandler(element, callbacks) {
  this.el = element;
  this.callbacks = callbacks;
  this.choices = null;
  this.button = null;
}

ChoiceHandler.prototype.startChallenge = function (challenge) {
  this.challenge = challenge;
  this.choice = null;
  this._render();
  this.callbacks.rendered(this.el);
};

ChoiceHandler.prototype._render = function () {
  this.el.innerHTML = Templates['choice'](this.challenge);
  this.choices = this.el.querySelector('.choices');
  this.button = this.el.querySelector('button');
  this.choices.onchange = this._handleChoice.bind(this);
  this.button.onclick = this._handleValidate.bind(this);
};

ChoiceHandler.prototype._handleChoice = function (event) {
  this.choice = event.target.value;
  this.el.querySelector('button').disabled = false;
//  [].forEach.call(this.choices.children, function (el) {
//    el.classList[el === event.target.parentNode ? 'add' : 'remove']('chosen');
//  });
};

ChoiceHandler.prototype._handleValidate = function () {
  var fn = this.choice == this.challenge.solution ? 'succeeded' : 'failed';
  this.callbacks[fn](this.choice);
};

module.exports = ChoiceHandler;
