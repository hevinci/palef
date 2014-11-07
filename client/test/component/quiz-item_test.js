var assert = require('assert');
var helpers = require('./../../src/util/test-helpers');

var quizItem = require('./../../src/component/quiz-item');

describe('component/quiz-item', function () {
  var item, baseData;

  beforeEach(function () {
    baseData = { uid: 1, quizUid: 2, text: 'Foo' };
    item = quizItem(baseData);
    helpers.appendElement(item);
  });

  afterEach(helpers.clean);

  it('creates a quiz item from the passed options', function () {
    helpers.assertElement(item, true);
    assert.equal(item.querySelector('span').innerHTML, 'Foo');
  });

  it('can be of type "multiple" or "single"', function () {
    assert.equal(item.querySelector('input').type, 'checkbox');
    item = quizItem({ uid: 1, quizUid: 2, type: 'single', text: 'Bar' });
    assert.equal(item.querySelector('input').type, 'radio');
  });

  describe('#selectedCallback', function () {
    it('is called when the item is selected or unselected', function (done) {
      var callback = sinon.spy();
      item.selectedCallback = callback;

      helpers.click('label')
        .then(function () { // check the item
          assert.ok(callback.calledWithExactly(1, true));
        })
        .then(helpers.click('label'))
        .then(function () { // un-check the item
          assert.ok(callback.calledTwice);
          assert.equal(callback.getCall(1).args[0], 1);
          assert.equal(callback.getCall(1).args[1], false);
        })
        .then(done, done);
    });
  });
});
