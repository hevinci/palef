var assert = require('assert');
var sinon = require('sinon');
var ChoiceHandler = require('./../../../src/quiz/handler/choice.js');
var fixtures = require('./../../../../fixtures/quiz/choice.js');

describe('quiz/handler/choice.js', function () {
  var handler, element, rendered, succeeded, failed;

  beforeEach(function () {
    rendered = sinon.spy();
    succeeded = sinon.spy();
    failed = sinon.spy();
    element = document.createElement('div');
    handler = new ChoiceHandler(element, {
      rendered: rendered,
      succeeded: succeeded,
      failed: failed
    });
    handler.startChallenge(fixtures.unique.challenge);
  });

  afterEach(function () {
   element = null;
  });

  it('renders multiple choice questions', function () {
    assert.ok(rendered.calledOnce);
    assert.notEqual(element.innerHTML, '');
  });

  it('executes a success callback in case of a correct answer', function () {
    handler._handleChoice({ target: { value: 0 }});
    handler._handleValidate();
    assert.ok(succeeded.calledOnce);
  });

  it('executes a failure callback in case of a wrong answer', function () {
    handler._handleChoice({ target: { value: 1 }});
    handler._handleValidate();
    assert.ok(failed.calledOnce);
  });
});
