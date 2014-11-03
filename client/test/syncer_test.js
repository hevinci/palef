var assert = require('assert');
var helpers = require('./../src/test-helpers');
var db = require('./../src/database');
var http = require('./../src/http');
var Trace = require('./../src/trace');
var Syncer = require('./../src/syncer');

// "waiting time" after sync calls: increase this value on slow systems
var delay = 20;

describe('syncer', function () {
  var syncer, singleTrace, dbTraces, progress;

  beforeEach(function () {
    db.open = sinon.stub();
    db.addTrace = sinon.stub();
    db.getTraces = sinon.stub();
    db.removeTraces = sinon.stub();
    db.updateProgress = sinon.stub();
    http.sendTraces = sinon.stub();
    syncer = new Syncer(db, http);
    syncer.syncedCallback = sinon.spy();
    singleTrace = new Trace(1, 2, 'quiz', true, 14);
    dbTraces = [
      { key: 1, value: 'tr 1' },
      { key: 2, value: 'tr 2' },
      { key: 3, value: 'tr 3' }
    ];
    progress = { foo: 'bar' };
  });

  describe('#syncTrace', function () {
    it('syncs a single trace immediately and updates progress', function (done) {
      http.sendTraces.returns(Promise.resolve(progress));
      db.updateProgress.returns(Promise.resolve(progress));
      syncer.syncTrace(singleTrace)
        .then(function () {
          assert.ok(http.sendTraces.calledWith([singleTrace]));
          assert.ok(db.updateProgress.calledAfter(http.sendTraces));
          assert.ok(db.updateProgress.calledWith(progress));
          assert.ok(syncer.syncedCallback.calledAfter(db.updateProgress));
          assert.ok(syncer.syncedCallback.calledWith(progress));
        })
        .then(done, done);
    });

    it('schedules a full sync if syncer is locked', function (done) {
      db.open.returns(Promise.resolve());
      db.getTraces.onCall(0).returns(Promise.resolve(dbTraces));
      db.getTraces.onCall(1).returns(Promise.resolve([{ key: 1, value: singleTrace }]));
      http.sendTraces.returns(Promise.resolve(progress));
      db.updateProgress.returns(Promise.resolve(progress));
      db.addTrace.returns(Promise.resolve());

      syncer.syncAll();
      syncer.syncTrace(singleTrace)
        .then(
          helpers.makeTestFailure('Syncer should be in lock state'),
          helpers.makeAssertError(syncer.SyncerLocked)
        )
        .then(function () {
          assert.ok(db.addTrace.calledWith(singleTrace))
        })
        .then(helpers.makeWaitPromise(delay))
        .then(function () {
          assert.ok(http.sendTraces.calledTwice);
          assert.deepEqual(['tr 1', 'tr 2', 'tr 3'], http.sendTraces.getCall(0).args[0]);
          assert.deepEqual([singleTrace], http.sendTraces.getCall(1).args[0]);
        })
        .then(done, done);
    });

    it('schedules a full sync if sync request failed', function (done) {
      testSyncTraceNetworkFailure(http.RequestFailure, done);
    });

    it('schedules a full sync if navigator is offline', function (done) {
      testSyncTraceNetworkFailure(http.NavigatorOffline, done);
    });

    it('throws an error if trace is not of the expected type', function (done) {
      syncer.syncTrace({})
        .then(
          helpers.makeTestFailure('An error should have been thrown'),
          helpers.makeAssertError(TypeError)
        )
        .then(done, done)
    });
  });

  describe('#syncAll', function () {
    it('transfers traces to the server and updates progress', function (done) {
      db.open.returns(Promise.resolve());
      db.getTraces.returns(Promise.resolve(dbTraces));
      http.sendTraces.returns(Promise.resolve(progress));
      db.updateProgress.returns(Promise.resolve(progress));

      syncer.syncAll()
        .then(function () {
          assert.ok(db.getTraces.calledAfter(db.open));
          assert.ok(http.sendTraces.calledAfter(db.getTraces));
          assert.ok(http.sendTraces.calledWith(['tr 1', 'tr 2', 'tr 3']));
          assert.ok(db.removeTraces.calledAfter(http.sendTraces));
          assert.ok(db.removeTraces.calledWith([1, 2, 3]));
          assert.ok(db.updateProgress.calledAfter(db.removeTraces));
          assert.ok(db.updateProgress.calledWith(progress));
          assert.ok(syncer.syncedCallback.calledAfter(db.updateProgress));
          assert.ok(syncer.syncedCallback.calledWith(progress));
        })
        .then(done, done);
    });

    it('schedules another sync if navigator is offline', function (done) {
      testSyncAllNetworkFailure(http.NavigatorOffline, done);
    });

    it('schedules another sync if xhr request failed', function (done) {
      testSyncAllNetworkFailure(http.RequestFailure, done);
    });

    it('is locked during sync operation, but re-syncs after if needed', function (done) {
      db.open.returns(Promise.resolve());
      db.getTraces.onCall(0).returns(Promise.resolve([{ key: 1, value: 'tr 1' }]));
      db.getTraces.onCall(1).returns(Promise.resolve([{ key: 2, value: 'tr 2' }]));
      http.sendTraces.onCall(0).returns(helpers.makeWaitPromise(10, 'Progress 1')());
      http.sendTraces.onCall(1).returns(Promise.resolve('Progress 2'));
      db.updateProgress.onCall(0).returns(Promise.resolve('Progress 1'));
      db.updateProgress.onCall(1).returns(Promise.resolve('Progress 2'));

      // "parallel" calls: only the first one should trigger a
      // sync, others should be blocked
      syncer.syncAll();
      syncer.syncAll().then(
        helpers.makeTestFailure('Sync attempt should not be successful'),
        helpers.makeAssertError(syncer.SyncerLocked)
      );
      syncer.syncAll().then(
        helpers.makeTestFailure('Sync attempt should not be successful'),
        helpers.makeAssertError(syncer.SyncerLocked)
      );

      // a re-sync for blocked calls should be triggered after
      // the first call completion
      helpers.makeWaitPromise(delay)()
        .then(function () {
          assert.ok(http.sendTraces.calledTwice);
          assert.ok(db.updateProgress.calledTwice);
          assert.ok(syncer.syncedCallback.calledTwice);
          assert.ok(db.removeTraces.calledTwice);
          assert.deepEqual(http.sendTraces.getCall(0).args[0], ['tr 1']);
          assert.deepEqual(http.sendTraces.getCall(1).args[0], ['tr 2']);
          assert.equal(db.updateProgress.getCall(0).args[0], 'Progress 1');
          assert.equal(db.updateProgress.getCall(1).args[0], 'Progress 2');
          assert.equal(syncer.syncedCallback.getCall(0).args[0], 'Progress 1');
          assert.equal(syncer.syncedCallback.getCall(1).args[0], 'Progress 2');
          assert.deepEqual(db.removeTraces.getCall(0).args[0], [1]);
          assert.deepEqual(db.removeTraces.getCall(1).args[0], [2]);
        })
        .then(done, done);
    });
  });

  function testSyncTraceNetworkFailure(expectedError, done) {
    db.open.returns(Promise.resolve());
    db.getTraces.returns(Promise.resolve([{ key: 1, value: singleTrace }]));
    http.sendTraces.returns(Promise.reject(new expectedError));
    db.addTrace.returns(Promise.resolve());

    syncer.syncTrace(singleTrace)
      .then(
      helpers.makeTestFailure('Request should have failed'),
      helpers.makeAssertError(expectedError)
    )
      .then(function () {
        assert.ok(db.addTrace.calledWith(singleTrace))
      })
      .then(helpers.makeWaitPromise(delay))
      .then(function () {
        assert.ok(http.sendTraces.calledTwice);
        assert.ok(http.sendTraces.alwaysCalledWith([singleTrace]));
      })
      .then(done, done);
  }

  function testSyncAllNetworkFailure(expectedError, done) {
    db.open.returns(Promise.resolve());
    db.getTraces.returns(Promise.resolve(dbTraces));
    http.sendTraces.onCall(0).returns(Promise.reject(new expectedError));
    http.sendTraces.onCall(1).returns(Promise.resolve(progress));
    db.updateProgress.returns(Promise.resolve(progress));
    syncer.scheduleDelay = 2;

    syncer.syncAll()
      .then(
        helpers.makeTestFailure('Sync attempt should not be successful'),
        helpers.makeAssertError(expectedError)
      )
      .then(helpers.makeWaitPromise(delay))
      .then(function () {
        assert.ok(http.sendTraces.calledTwice);
        assert.ok(db.updateProgress.calledOnce);
        assert.ok(db.updateProgress.calledWith(progress));
        assert.ok(syncer.syncedCallback.calledOnce);
        assert.ok(syncer.syncedCallback.calledWith(progress));
        assert.ok(db.removeTraces.calledOnce);
        assert.ok(db.removeTraces.calledWith([1, 2, 3]));
      })
      .then(done, done);
  }
});
