function QuizPlayer(element) {
  this.el = element;
  this.typeHandlers = {};
  this.initializedHandlers = [];
  this.callbacks = {
    rendered: this._onChallengeRendered.bind(this),
    succeeded: this._onChallengeSucceeded.bind(this),
    failed: this._onChallengeFailed.bind(this)
  }
}

QuizPlayer.prototype.supports = function (quizType) {
  return this.typeHandlers[quizType] !== undefined;
};

QuizPlayer.prototype.setHandlers = function (handlers) {
  this.typeHandlers = handlers;
};

QuizPlayer.prototype.play = function (quiz) {
  if (!this.supports(quiz.type)) {
    throw new Error('Unsupported quiz type "' + quiz.type + '"');
  }
  if (this.initializedHandlers.indexOf(quiz.type) < 0) {
    this.typeHandlers[quiz.type] = new this.typeHandlers[quiz.type](
      this.el, //nope
      this.callbacks
    );
    this.initializedHandlers.push(quiz.type);
  }
  this.quiz = quiz;
  this.typeHandlers[quiz.type].startChallenge(quiz.challenge);
};

QuizPlayer.prototype._render = function (data) {
  this.innerHTML = Templates['player']({
    desc: data.author.name + ', ' + data.created
  });
};

QuizPlayer.prototype._onChallengeRendered = function () {
  console.log('rendered');
  this._render(this.quiz.metadata);
};

QuizPlayer.prototype._onChallengeSucceeded = function () {
  console.log('succeeded');
};

QuizPlayer.prototype._onChallengeFailed = function () {
  console.log('failed');
};

module.exports = QuizPlayer;
