var assert = require('assert');
var helpers = require('./../../src/test-helpers');

require('./../../src/component/quiz-item-text');

describe('component/quiz-item-text', function () {
  var item, baseData;

  beforeEach(function () {
    item = document.createElement('quiz-item-text');
    helpers.appendElement(item);
    baseData = { uid: 1, quizUid: 2, text: 'Foo' };
  });

  afterEach(helpers.clean);

  describe('#createdCallback', function () {
    it('builds the element and its inner content', function () {
      helpers.assertElement(item, true);
    });
  });

  describe('#setData', function () {
    it('binds data to the inner elements', function () {
      item.setData(baseData);
      assert.equal('Foo', item.querySelector('span').innerHTML);
    });
    it('defaults to type "single" (radio)', function () {
      item.setData(baseData);
      assert.equal('radio', item.querySelector('input').type);
    });
    it('allows the type "multiple" (checkbox)', function () {
      baseData.type = 'multiple';
      item.setData(baseData);
      assert.equal('checkbox', item.querySelector('input').type);
    });
  });

  describe('#selectedCallback', function () {
    it('is called when the item is selected', function (done) {
      var callback = sinon.spy();
      baseData.type = 'multiple';
      item.selectedCallback = callback;
      item.setData(baseData);

      helpers.click('label').then(function () { // check the item
        assert.ok(callback.calledWithExactly(1, true));
        helpers.click('label').then(function () { // un-check the item
          assert.ok(callback.calledTwice);
          assert.equal(1, callback.getCall(1).args[0]);
          assert.equal(false, callback.getCall(1).args[1]);
          done();
        });
      });
    });
  });
});
