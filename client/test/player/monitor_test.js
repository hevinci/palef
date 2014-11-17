var assert = require('assert');
var Monitor = require('./../../src/player/monitor');
var Trace = require('./../../src/player/trace');

describe('monitor', function () {
  var monitor, db, syncer, modules;

  beforeEach(function () {
    db = {
      open: sinon.stub(),
      getProgress: sinon.stub(),
      updateProgress: sinon.stub()
    };
    syncer = {
      syncTrace: sinon.stub()
    };
    modules = [
      require('./../../../fixtures/module/module1'),
      require('./../../../fixtures/module/module2'),
      require('./../../../fixtures/module/module3'),
      require('./../../../fixtures/module/module4')
    ];
    monitor = new Monitor(syncer, db, modules);

    db.open.returns(Promise.resolve());
    db.getProgress.returns(Promise.resolve(null));
    db.updateProgress.returns(Promise.resolve());
  });

  describe('#getModuleList', function () {
    it('returns the list of available modules', function (done) {
      db.getProgress.returns(Promise.resolve({ modules: [1, 2, 3, 4] }));
      monitor.getModuleList()
        .then(function (modules) {
          assert.deepEqual(modules, [1, 2, 3, 4]);
        })
        .then(done, done);
    });

    it('fetches data from db only once', function (done) {
      db.getProgress.returns(Promise.resolve({ modules: [1, 2, 3, 4] }));
      monitor.getModuleList()
        .then(monitor.getModuleList.bind(monitor))
        .then(monitor.getModuleList.bind(monitor))
        .then(function () {
          assert.ok(db.open.calledOnce);
          assert.ok(db.getProgress.calledOnce);
        })
        .then(done, done);
    });

    it('builds empty stats if no data is in db', function (done) {
      monitor.getModuleList()
        .then(function (modules) {
          assert.equal(modules.length, 4);
          // just test the first module...
          assert.equal(modules[0].stepCount, 5);
          assert.equal(modules[0].completedSteps, 0);
        })
        .then(done, done);
    });
  });

  describe('#recordTrace', function () {
    it('delegates to syncer', function (done) {
      var trace = new Trace(1, 2, 'text', true);
      monitor.recordTrace(trace)
        .then(function () {
          assert.ok(syncer.syncTrace.calledWith(trace));
        })
        .then(done, done);
    });

    it('re-computes stats for local use', function (done) {
      var trace = new Trace(1, 4, 'quiz-choice', true, 10);

      monitor.getModuleList()
        .then(function (modules) {
          assert.equal(modules[0].score, 0);
          assert.equal(modules[0].steps[3].score, 0);
          assert.equal(modules[0].steps[3].complete, false);
        })
        .then(function () {
          return monitor.recordTrace(trace);
        })
        .then(monitor.getModuleList.bind(monitor))
        .then(function (modules) {
          assert.equal(modules[0].score, 10);
          assert.equal(modules[0].steps[3].score, 10);
          assert.equal(modules[0].steps[3].complete, true);
        })
        .then(done, done);
    });

    it('throws an error if trace is of the wrong type', function () {
      assert.throws(function () {
        monitor.recordTrace('wrong');
      });
    });
  });

  describe('#getStep', function () {
    it('finds a step of a given module', function () {
      var step = monitor.getStep(1, 1);
      assert.equal(step.type, 'chapter');
      assert.equal(step.title, 'Chapitre 1 : Sit amet risus');
    });

    it('throws an error if the module cannot be found', function () {
      assert.throws(function () {
        monitor.getStep(123, 2);
      });
    });

    it('throws an error if the step cannot be found', function () {
      assert.throws(function () {
        monitor.getStep(1, 234);
      });
    });
  });

  describe('#getPreviousStepId', function () {
    it('finds the id of the previous step', function () {
      assert.equal(monitor.getPreviousStepId(1, 2), 1);
    });

    it('throws an error if the module id cannot be found', function () {
      assert.throws(function () {
        monitor.getPreviousStepId(123, 2);
      });
    });

    it('throws an error if the current step id cannot be found', function () {
      assert.throws(function () {
        monitor.getPreviousStepId(1, 234);
      });
    });

    it('returns null if the current step is the first one', function () {
      assert.strictEqual(monitor.getPreviousStepId(1, 1), null);
    });
  });

  describe('#getNextStepId', function () {
    it('finds the id of the next step', function () {
      assert.equal(monitor.getNextStepId(1, 1), 2);
    });

    it('throws an error if the module id cannot be found', function () {
      assert.throws(function () {
        monitor.getNextStepId(123, 2);
      });
    });

    it('throws an error if the current step id cannot be found', function () {
      assert.throws(function () {
        monitor.getNextStepId(1, 234);
      });
    });

    it('returns nothing if the current step is the last one', function () {
      assert.strictEqual(monitor.getNextStepId(1, 5), null);
    });
  });
});
