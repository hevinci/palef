var assert = require('assert');
var sinon = require('sinon');
var ChoiceHandler = require('./../../../src/quiz/handler/choice.js');
var fixtures = require('./../../../../fixtures/quiz/choice.js');

describe('quiz/handler/choice.js', function () {
  var handler, element, rendered, succeeded, failed;

  beforeEach(function () {
    element = document.createElement('div');
    element.style.display = 'none';
    document.body.appendChild(element);
    rendered = sinon.spy();
    succeeded = sinon.spy();
    failed = sinon.spy();
    handler = new ChoiceHandler(element, {
      rendered: rendered,
      succeeded: succeeded,
      failed: failed
    });
    handler.startChallenge(fixtures.unique.challenge);
  });

  afterEach(function () {
    document.body.removeChild(element);
    element = null;
  });

  it('renders multiple choice questions', function () {
    assert.ok(rendered.calledOnce);
    assert.notEqual(element.innerHTML, '');
  });
  it('executes a success callback in case of a correct answer', function () {
    element.querySelector('label').dispatchEvent(new Event('click'));
    setTimeout(function () {
      element.querySelector('button').dispatchEvent(new Event('click'));
      assert.ok(succeeded.calledOnce);
    }, 600);
  });
  it('executes a failure callback in case of a wrong answer', function () {
    element.querySelector('label').nextSibling.dispatchEvent(new Event('click'));
    setTimeout(function () {
      element.querySelector('button').dispatchEvent(new Event('click'));
      assert.ok(failed.calledOnce);
    }, 600);
  });
});
