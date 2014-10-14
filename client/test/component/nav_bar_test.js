var assert = require('assert');
var helpers = require('./../../src/test_helpers');

require('./../../src/component/nav_bar');

describe('component/nav-bar', function () {
  var nav;

  beforeEach(function () {
    nav = document.createElement('nav-bar');
  });

  describe('#createdCallback', function () {
    it('builds the element and its inner content', function () {
      helpers.assertElement(nav, true);
    });
    it('adds a home link', function () {
      assert.ok(nav.querySelector('a.home-link'));
    });
  });

  describe('#displayCenter', function () {
    it('updates the center of the bar', function () {
      nav.displayCenter(document.createTextNode('Foo'));
      assert.equal('Foo', nav.querySelector('.center-box').innerHTML);
    });
  });

  describe('#displayRight', function () {
    it('updates the right of the bar', function () {
      nav.displayRight(document.createTextNode('Bar'));
      assert.equal('Bar', nav.querySelector('.right-box').innerHTML);
    });
  });
});
