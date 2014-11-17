var assert = require('assert');
var helpers = require('./../../src/util/test-helpers');
var db = require('./../../src/player/database');
var Trace = require('./../../src/player/trace');

describe('database', function () {

  afterEach(function (done) {
    db.destroy('palef-test')
      .then(done, done);
  });

  describe('#open', function () {
    it('opens the database and creates it if needed', function (done) {
      db.open('palef-test')
        .then(function (_db) {
          assert.ok(_db instanceof IDBDatabase);
          assert.equal(_db.name, 'palef-test');
          assert.equal(_db.objectStoreNames.length, 2);
          assert.deepEqual(
            [].slice.call(_db.objectStoreNames),
            ['stats', 'traces']
          );
        })
        .then(done, done);
    });
  });

  describe('#addTrace', function () {
    it('adds a trace in the traces store', function (done) {
      db.open('palef-test')
        .then(function () {
          return db.addTrace(new Trace(1, 2, 'quiz', true, 10));
        })
        .then(db.getTraces)
        .then(function (traces) {
          assert.equal(traces.length, 1);
          assert.equal(traces[0].value.module, 1);
          assert.equal(traces[0].value.step, 2);
          assert.equal(traces[0].value.type, 'quiz');
          assert.equal(traces[0].value.score, 10);
          assert.equal(typeof traces[0].value.time, 'number');
        })
        .then(done, done);
    });

    it('throws an error if trace is not of the expected type', function (done) {
      db.open('palef-test')
        .then(function () {
          return db.addTrace('foo');
        })
        .then(
          helpers.makeTestFailure('An error should have been thrown'),
          helpers.makeAssertError(TypeError)
        )
        .then(done, done);
    });
  });

  describe('#removeTraces', function () {
    it('removes traces with the given ids', function (done) {
      db.open('palef-test')
        .then(function () {
          return db.addTrace(new Trace(1, 1, 'text', true));
        })
        .then(function () {
          return db.addTrace(new Trace(1, 2, 'quiz', true, 5));
        })
        .then(function () {
          return db.addTrace(new Trace(1, 3, 'quiz', true, 7));
        })
        .then(db.getTraces)
        .then(function (traces) {
          assert.equal(traces.length, 3);
        })
        .then(function () {
          // remove the two first traces
          return db.removeTraces([1, 2]);
        })
        .then(db.getTraces)
        .then(function (traces) {
          // third trace (id 3) still exists
          assert.equal(traces.length, 1);
          assert.equal(traces[0].key, 3);
        })
        .then(done, done);
    });
  });

  describe('#updateProgress', function () {
    it('creates or updates current progression', function (done) {
      db.open('palef-test')
        .then(function () {
          return db.updateProgress('Fake progress');
        })
        .then(db.getProgress)
        .then(function (progress) {
          assert.strictEqual(progress, 'Fake progress');
        })
        .then(done, done);
    });
  });

  describe('#getProgress', function () {
    it('returns null if no stats have been recorded', function (done) {
      db.open('palef-test')
        .then(db.getProgress)
        .then(function (progress) {
          assert.strictEqual(progress, null);
        })
        .then(done, done);
    });
  });
});
