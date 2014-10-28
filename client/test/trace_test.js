var assert = require('assert');
var Trace = require('./../src/trace');

describe('trace', function () {
  it('holds trace data and timestamp', function () {
    var trace = new Trace(1, 1, 'text');
    assert.strictEqual(trace.module, 1);
    assert.strictEqual(trace.step, 1);
    assert.strictEqual(trace.type, 'text');
    assert.ok(typeof trace.time === 'number');
  });

  it('accepts an additional score argument', function () {
    var trace = new Trace(1, 1, 'quiz', 21);
    assert.strictEqual(trace.score, 21);
  });

  it('throws an error if data is missing', function () {
    assert.throws(function () { new Trace() });
    assert.throws(function () { new Trace(1) });
    assert.throws(function () { new Trace(1, 2) });
    assert.throws(function () { new Trace(1, 2, undefined) });
  });

  it('throws an error if data is of the wrong type', function () {
    assert.throws(function () { new Trace('foo', 2, 'quiz', 12) });
    assert.throws(function () { new Trace(1, 'bar', 'quiz', 12) });
    assert.throws(function () { new Trace(1, 2, 3, 12) });
    assert.throws(function () { new Trace(1, 2, 3, 'baz') });
  });
});