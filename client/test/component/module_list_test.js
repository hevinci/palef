var assert = require('assert');
var helpers = require('./../../src/test_helpers');

require('./../../src/component/module_list');

describe('component/module-list', function () {
  var list;

  beforeEach(function () {
    list = document.createElement('module-list');
  });

  describe('#createdCallback', function () {
    it('builds an empty element', function () {
      helpers.assertElement(list, false);
    });
  });

  describe('#setModules', function () {
    it('adds modules to the list', function () {
      list.setModules([
        { id: 1, title: 'Foo' },
        { id: 2, title: 'Bar' }
      ]);
      assert.equal(2, list.querySelectorAll('a').length);
    });
  });
});
