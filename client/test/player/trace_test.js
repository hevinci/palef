var assert = require('assert');
var Trace = require('./../../src/player/trace');

describe('trace', function () {
  it('holds trace data and timestamp', function () {
    var trace = new Trace(1, 1, 'text', true);
    assert.strictEqual(trace.module, 1);
    assert.strictEqual(trace.step, 1);
    assert.strictEqual(trace.type, 'text');
    assert.strictEqual(trace.complete, true);
    assert.ok(typeof trace.time === 'number');
  });

  it('accepts an additional score argument', function () {
    var trace = new Trace(1, 1, 'quiz', true, 21);
    assert.strictEqual(trace.score, 21);
  });

  it('allows a score of 0', function () {
    var trace = new Trace(1, 2, 'quiz', true, 0);
    assert.strictEqual(0, trace.score);
  });

  it('makes the score attribute null if not provided', function () {
    var trace = new Trace(1, 1, 'video', false);
    assert.strictEqual(null, trace.score);
  });

  it('throws an error if data is missing', function () {
    assert.throws(function () { new Trace() });
    assert.throws(function () { new Trace(1) });
    assert.throws(function () { new Trace(1, 2) });
    assert.throws(function () { new Trace(1, 2, undefined) });
  });

  it('throws an error if data is of the wrong type', function () {
    assert.throws(function () { new Trace('wrong', 2, 'quiz', true, 12) });
    assert.throws(function () { new Trace(1, 'wrong', 'quiz', true, 12) });
    assert.throws(function () { new Trace(1, 2, 1337, true) });
    assert.throws(function () { new Trace(1, 2, 3, true, 'wrong') });
  });
});