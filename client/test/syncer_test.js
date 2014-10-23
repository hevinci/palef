var assert = require('assert');
var db = require('./../src/database');
var http = require('./../src/http');
var Syncer = require('./../src/syncer');

describe('syncer', function () {
  var syncer, dbTraces, progress;

  beforeEach(function () {
    db.open = sinon.stub();
    db.getTraces = sinon.stub();
    db.removeTraces = sinon.stub();
    db.updateProgress = sinon.stub();
    http.sendTraces = sinon.stub();
    syncer = new Syncer(db, http);
    syncer.syncedCallback = sinon.spy();
    dbTraces = [
      { key: 1, value: 'tr 1' },
      { key: 2, value: 'tr 2' },
      { key: 3, value: 'tr 3' }
    ];
    progress = { foo: 'bar' };
  });

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
        assert.ok(db.updateProgress.calledAfter(http.sendTraces));
        assert.ok(db.updateProgress.calledWith(progress));
        assert.ok(syncer.syncedCallback.calledAfter(db.updateProgress));
        assert.ok(syncer.syncedCallback.calledWith(progress));
        assert.ok(db.removeTraces.calledAfter(syncer.syncedCallback));
        assert.ok(db.removeTraces.calledWith([1, 2, 3]));
      })
      .then(done, done);
  });

  it('stops if no traces are available', function (done) {
    db.open.returns(Promise.resolve());
    db.getTraces.returns(Promise.reject(new db.NoTraces));

    syncer.syncAll()
      .then(function () {
        assert.ok(!http.sendTraces.called);
        assert.ok(!syncer.syncedCallback.called);
        assert.ok(!db.removeTraces.called);
      })
      .then(done, done);
  });

  it('schedules another sync if navigator is offline', function (done) {
    testNetworkFailure(new http.NavigatorOffline, done);
  });

  it('schedules another sync if xhr request failed', function (done) {
    testNetworkFailure(new http.RequestFailure, done);
  });

  it('is locked during sync operation, but re-sync after if needed', function (done) {
    db.open.returns(Promise.resolve());
    db.getTraces.onCall(0).returns(Promise.resolve([{ key: 1, value: 'tr 1' }]));
    db.getTraces.onCall(1).returns(Promise.resolve([{ key: 2, value: 'tr 2' }]));
    http.sendTraces.onCall(0).returns(fakeDelayedHttp(10, 'Progress 1'));
    http.sendTraces.onCall(1).returns(Promise.resolve('Progress 2'));
    db.updateProgress.onCall(0).returns(Promise.resolve('Progress 1'));
    db.updateProgress.onCall(1).returns(Promise.resolve('Progress 2'));

    // only the first call should be immediately effective
    syncer.syncAll();
    syncer.syncAll();
    syncer.syncAll();
    syncer.syncAll();

    // another sync should be triggered after the first call completion
    setTimeout(function () {
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
      done();
    }, 30);
  });

  function testNetworkFailure(testedError, doneCallback) {
    db.open.returns(Promise.resolve());
    db.getTraces.returns(Promise.resolve(dbTraces));
    http.sendTraces.onCall(0).returns(Promise.reject(testedError));
    http.sendTraces.onCall(1).returns(Promise.resolve(progress));
    db.updateProgress.returns(Promise.resolve(progress));
    syncer.scheduleDelay = 10;

    syncer.syncAll()
      .then(function () {
        setTimeout(function () {
          assert.ok(http.sendTraces.calledTwice);
          assert.ok(db.updateProgress.calledOnce);
          assert.ok(db.updateProgress.calledWith(progress));
          assert.ok(syncer.syncedCallback.calledOnce);
          assert.ok(syncer.syncedCallback.calledWith(progress));
          assert.ok(db.removeTraces.calledOnce);
          assert.ok(db.removeTraces.calledWith([1, 2, 3]));
          doneCallback();
        }, 15);
      });
  }

  function fakeDelayedHttp(delay, response) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(response);
      }, delay);
    });
  }
});
