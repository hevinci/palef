var assert = require('assert');
var Dispatcher = require('./../../src/player/dispatcher').Dispatcher;

describe('dispatcher', function () {
  var dispatcher;

  beforeEach(function () {
    dispatcher = new Dispatcher();
  });

  it('triggers listeners for each event', function () {
    var listener1 = sinon.spy();
    var listener2 = sinon.spy();
    dispatcher.on('foo', listener1);
    dispatcher.on('bar', listener2);
    dispatcher.trigger('foo');
    dispatcher.trigger('bar');
    assert.ok(listener1.calledOnce);
    assert.ok(listener2.calledOnce);
  });

  it('accepts multiple listeners for an event', function () {
    var listener1 = sinon.spy();
    var listener2 = sinon.spy();
    dispatcher.on('foo', listener1);
    dispatcher.on('foo', listener2);
    dispatcher.trigger('foo');
    assert.ok(listener1.calledOnce);
    assert.ok(listener2.calledOnce);
  });

  it('passes the triggered data to the listener', function () {
    var listener = sinon.spy();
    var data = { bar: 'baz' };
    dispatcher.on('foo', listener);
    dispatcher.trigger('foo', data);
    assert.ok(listener.calledOnce);
    assert.ok(listener.calledWith(data));
  });
});
