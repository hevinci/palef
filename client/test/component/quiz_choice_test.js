var assert = require('assert');
var helpers = require('./../../src/test_helpers');

require('./../../src/component/quiz_choice');

describe('component/quiz-choice', function () {
  var quiz, baseChallenge, baseSolutions;

  beforeEach(function () {
    quiz = document.createElement('quiz-choice');
    helpers.appendElement(quiz);
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
  });

  afterEach(helpers.clean);

  describe('#createdCallback', function () {
    it('builds the element and its inner content', function () {
      helpers.assertElement(quiz, true);
    });
  });

  describe('#setChallenge', function () {
    it('appends items of the given type', function () {
      var items;
      quiz.setChallenge(baseChallenge);
      items = quiz.querySelectorAll('quiz-item-text');
      assert.equal(3, items.length);
      assert.equal('checkbox', items[0].querySelector('input').type);
    });
  });

  describe('#computeScore', function () {
    it('returns a default score of 0', function () {
      assert.equal(0, quiz.computeScore(baseSolutions));
    });
    it('returns the associated score when type is "single"', function () {
      baseChallenge.type = 'single';
      quiz.setChallenge(baseChallenge);
      quiz.chosenItemUids = [2];
      assert.equal(1, quiz.computeScore(baseSolutions));
    });
    it('sums the associated scores when type is "multiple"', function () {
      quiz.setChallenge(baseChallenge);
      quiz.chosenItemUids = [1, 2, 3];
      assert.equal(3, quiz.computeScore(baseSolutions));
    });
  });

  describe('#validatedCallback', function () {
    it('is called when the user validates his answer(s)', function (done) {
      var callback = sinon.spy();
      quiz.validatedCallback = callback;
      quiz.setChallenge(baseChallenge);

      helpers.click('button').then(function () {
        assert.equal(callback.called, false); // no answer is selected
        helpers.click('label').then(function () { // select an answer
          helpers.click('button').then(function () { // validate
            assert.ok(callback.calledOnce);
            assert.equal(1, quiz.chosenItemUids.length);
            assert.equal(baseSolutions[0].uid, quiz.chosenItemUids[0]);
            done();
          });
        });
      });
    });
  });
});
