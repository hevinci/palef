var assert = require('assert');
var helpers = require('./../../src/util/test-helpers');

var headerFunc = require('./../../src/component/header');

describe('component/header', function () {
  var header;

  beforeEach(function () {
    header = headerFunc();
    helpers.appendElement(header);
  });

  afterEach(helpers.clean);

  it('creates a header element', function () {
    assert.equal(header.tagName.toLowerCase(), 'header');
  });

  describe('#setTitle', function () {
    it('adds a main title to the header', function () {
      header.setTitle('Foo');
      assert.equal(header.querySelector('h1').textContent, 'Foo');
    });
  });

  describe('#setArrowState', function () {
    it('enables or disables step navigation', function () {
      var previous = header.querySelector('a.previous');
      var next = header.querySelector('a.next');

      header.setArrowState({ previous: false, next: false });
      assert.ok(previous.classList.contains('disabled'));
      assert.ok(next.classList.contains('disabled'));

      header.setArrowState({ previous: '#/foo', next: false });
      assert.ok(!previous.classList.contains('disabled'));
      assert.ok(next.classList.contains('disabled'));
      assert.equal(previous.href, document.documentURI + '#/foo');
    });
  });
});
