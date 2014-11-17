var assert = require('assert');
var helpers = require('./../../src/util/test-helpers');
var http = require('./../../src/player/http');

describe('http', function () {

  describe('#onlineCallback', function () {
    it('is called when the browser propagates an online event', function () {
      var callback = sinon.spy();
      http.onlineCallback = callback;
      document.body.dispatchEvent(helpers.createEvent('online'));
      assert.ok(callback.calledOnce);
    })
  });

  describe('#sendTraces', function () {
    var server;
    var respondWith = function (status, body) {
      server.autoRespond = true;
      server.respondWith('POST', './traces', [
        status,
        { "Content-Type": "application/json" },
        body
      ]);
    };

    beforeEach(function () {
      server = sinon.fakeServer.create();
    });

    afterEach(function () {
      server.restore();
    });

    it('send traces as json and returns a progress object', function (done) {
      respondWith(200, '{ "foo": 123 }');
      http.sendTraces(['bar', 123])
        .then(function (progress) {
          assert.deepEqual({ foo: 123 }, progress);
        })
        .then(done, done);
    });

    it('returns an error if response cannot be parsed', function (done) {
      respondWith(200, '{ [not-json*": 123');
      http.sendTraces(['bar', 123])
        .catch(function (error) {
          assert.ok(error instanceof http.NotJsonResponse);
        })
        .then(done, done);
    });

    it('returns an error if status code is not 200', function (done) {
      respondWith(500, '');
      http.sendTraces(['bar', 123])
        .catch(function (error) {
          assert.ok(error instanceof http.NotSuccessResponse);
        })
        .then(done, done);
    });

    it('returns an error if request failed', function (done) {
      respondWith(0, '');
      http.sendTraces(['bar', 123])
        .catch(function (error) {
          assert.ok(error instanceof http.RequestFailure);
        })
        .then(done, done);
    });

    it('returns an error if navigator is offline', function (done) {
      document.body.dispatchEvent(helpers.createEvent('offline'));
      http.sendTraces(['bar', 123])
        .catch(function (error) {
          assert.ok(error instanceof http.NavigatorOffline);
        })
        .then(done, done);
    });
  });
});
