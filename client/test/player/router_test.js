var assert = require('assert');
var Router = require('./../../src/player/router');

describe('router', function () {
  var router;

  beforeEach(function () {
    router = new Router();
  });

  it('does nothing if no pattern is matched', function () {
    assert.equal(router.execute(/foo/), false);
  });

  it('executes the first handler matching a pattern', function () {
    var handler1 = sinon.spy();
    var handler2 = sinon.spy();
    router.add(/foo/, handler1);
    router.add(/fooBar/, handler2);
    assert.ok(router.execute('#fooB'));
    assert.ok(handler1.calledOnce);
    assert.equal(handler2.callCount , 0);
  });

  it('passes capture groups data to the handler', function () {
    var handler = sinon.spy();
    router.add(/foo\/(\d+)\/bar\/(\w+)/, handler);
    assert.ok(router.execute('#foo/123/bar/baz'));
    assert.ok(handler.calledOnce);
    assert.ok(handler.calledWithExactly('123', 'baz'));
  });
});
