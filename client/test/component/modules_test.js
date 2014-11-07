var assert = require('assert');
var helpers = require('./../../src/util/test-helpers');

var modulesFunc = require('./../../src/component/modules');

describe('component/modules', function () {
  var modules;

  beforeEach(function () {
    modules = modulesFunc();
    helpers.appendElement(modules);
  });

  afterEach(helpers.clean);

  it('creates a container element', function () {
    assert.equal(modules.tagName.toLowerCase(), 'main');
  });

  describe('#setList', function () {
    it('fills the container with module cards', function () {
      modules.setList([{
        id: 1,
        title: 'Foo',
        score: 5,
        max: 10,
        stepCount: 2,
        completedSteps: 3
      }]);
      assert.equal(modules.children.length, 1);
      assert.equal(modules.children[0].querySelector('h2').textContent, 'Foo');
    });
  });
});
