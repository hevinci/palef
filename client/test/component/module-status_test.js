var assert = require('assert');
var helpers = require('./../../src/test-helpers');

require('./../../src/component/module-status');

describe('component/module-status', function () {
  var status;

  beforeEach(function () {
    status = document.createElement('module-status');
  });

  describe('#createdCallback', function () {
    it('builds the element and its inner content', function () {
      helpers.assertElement(status, true);
    });
  });

  describe('#showStatus', function () {
    it('displays module title and step progress', function () {
      var countParts;
      status.showStatus({ moduleTitle: 'Foo', currentStep: 3, stepCount: 5});
      assert.equal('Foo', status.querySelector('.title-box').innerHTML);
      countParts = status.querySelectorAll('.count-box span');
      assert.equal('3', countParts[0].innerHTML);
      assert.equal('5', countParts[1].innerHTML);
    });
  });
});
