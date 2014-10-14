var assert = require('assert');
var helpers = require('./../../src/test_helpers');

require('./../../src/component/module_status');

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
      status.showStatus({ moduleTitle: 'Foo', currentStep: 3, stepCount: 5});
      assert.equal('Foo', status.querySelector('.title-box').innerHTML);
      assert.equal('(3/5)', status.querySelector('.count-box').innerHTML);
    });
  });
});

