var assert = require('assert');
var helpers = require('./../src/test-helpers');
var db = require('./../src/database');
var Trace = require('./../src/trace');

describe('database', function () {

  afterEach(function (done) {
    db.destroy('palef-test')
      .then(done, done);
  });

  describe('#open', function () {
    it('creates the database if needed', function (done) {
      db.open('palef-test')
        .then(function (_db) {
          assert.ok(_db instanceof IDBDatabase);
          assert.equal('palef-test', _db.name);
          assert.equal(2, _db.objectStoreNames.length);
          assert.deepEqual(
            ['stats', 'traces'],
            [].slice.call(_db.objectStoreNames)
          );
        })
        .then(done, done);
    });
  });

  describe('#addTrace', function () {
    it('adds a trace in the traces store', function (done) {
      db.open('palef-test')
        .then(function () {
          return db.addTrace(new Trace(1, 2, 'quiz', 10));
        })
        .then(db.getTraces)
        .then(function (traces) {
          assert.equal(1, traces.length);
          assert.equal(1, traces[0].value.module);
          assert.equal(2, traces[0].value.step);
          assert.equal('quiz', traces[0].value.type);
          assert.equal(10, traces[0].value.score);
          assert.equal('number', typeof traces[0].value.time);
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
          return db.addTrace(new Trace(1, 1, 'text'));
        })
        .then(function () {
          return db.addTrace(new Trace(1, 2, 'quiz', 5));
        })
        .then(function () {
          return db.addTrace(new Trace(1, 3, 'quiz', 7));
        })
        .then(db.getTraces)
        .then(function (traces) {
          assert.equal(3, traces.length);
        })
        .then(function () {
          // remove the two first traces
          return db.removeTraces([1, 2]);
        })
        .then(db.getTraces)
        .then(function (traces) {
          // third trace (id 3) still exists
          assert.equal(1, traces.length);
          assert.equal(3, traces[0].key);
        })
        .then(done, done);
    });
  });
});
