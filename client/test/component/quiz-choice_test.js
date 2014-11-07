var assert = require('assert');
var helpers = require('./../../src/util/test-helpers');

var quizChoice = require('./../../src/component/quiz-choice');

describe('component/quiz-choice', function () {
  var quiz, baseChallenge, baseSolutions;

  beforeEach(function () {
    baseChallenge = {
      uid: 1,
      type: 'multiple',
      title: "Question ?",
      items: [
        { uid: 1, text: "Answer 1"},
        { uid: 2, text: "Answer 2"},
        { uid: 3, text: "Answer 3"}
      ]
    };
    baseSolutions = [
      { uid: 1, score: 0 },
      { uid: 2, score: 1 },
      { uid: 3, score: 2 }
    ];
    quiz = quizChoice(baseChallenge);
    helpers.appendElement(quiz);
  });

  afterEach(helpers.clean);

  it('creates a quiz from a challenge object', function () {
    var items;
    helpers.assertElement(quiz, true);
    items = quiz.querySelectorAll('li');
    assert.equal(items.length, 3);
    assert.equal(items[0].querySelector('input').type, 'checkbox');
  });

  describe('#setChallenge', function () {
    it('binds a new challenge to the current quiz', function () {
      var items;
      quiz.setChallenge({
        uid: 1,
        type: 'single',
        title: "Question 2 ?",
        items: [
          { uid: 1, text: "Answer 1"},
          { uid: 2, text: "Answer 2"},
          { uid: 3, text: "Answer 3"}
        ]
      });

      items = quiz.querySelectorAll('li');
      assert.equal(items.length, 3);
      assert.equal(items[0].querySelector('input').type, 'radio');
    });
  });

  describe('#computeScore', function () {
    it('returns a default score of 0', function () {
      assert.equal(quiz.computeScore(baseSolutions), 0);
    });

    it('returns the associated score when type is "single"', function () {
      baseChallenge.type = 'single';
      quiz.setChallenge(baseChallenge);
      quiz.chosenItemUids = [2];
      assert.equal(quiz.computeScore(baseSolutions), 1);
    });

    it('sums the associated scores when type is "multiple"', function () {
      quiz.setChallenge(baseChallenge);
      quiz.chosenItemUids = [1, 2, 3];
      assert.equal(quiz.computeScore(baseSolutions), 3);
    });
  });

  describe('#validatedCallback', function () {
    it('is called when the user validates his answer(s)', function (done) {
      var callback = sinon.spy();
      quiz.validatedCallback = callback;
      quiz.setChallenge(baseChallenge);

      helpers.click('div.icon-tick')
        .then(function () {
          assert.equal(callback.called, false); // no answer is selected
        })
        .then(function () {
          return helpers.click('label');
        })
        .then(function () {
          return helpers.click('div.icon-tick'); // validate
        })
        .then(function () {
          assert.ok(callback.calledOnce);
          assert.equal(quiz.chosenItemUids.length, 1);
          assert.equal(quiz.chosenItemUids[0], baseSolutions[0].uid);
        })
        .then(done, done);
    });
  });
});
