var assert = require('assert');
var helpers = require('./../../src/test-helpers');

require('./../../src/component/module-controls');

describe('component/module-controls', function () {
  var controls;

  beforeEach(function () {
    controls = document.createElement('module-controls');
  });

  describe('#createdCallback', function () {
    it('builds the element and its inner content', function () {
      helpers.assertElement(controls, true);
    });
  });

  describe('#showControls', function () {
    it('displays step navigation controls if needed', function () {
      var left = controls.querySelectorAll('a')[0];
      var right = controls.querySelectorAll('a')[1];
      controls.showControls({ moduleId: 1, previousStep: false, nextStep: 2 });
      assert.equal('hidden', left.className);
      assert.equal('', right.className);
    });
  });
});
