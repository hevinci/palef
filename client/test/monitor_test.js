var assert = require('assert');
var Monitor = require('./../src/monitor');
var Trace = require('./../src/trace');

describe('monitor', function () {
  var monitor, db, syncer, modules;

  beforeEach(function () {
    db = {
      open: sinon.stub(),
      getProgress: sinon.stub()
    };
    syncer = {
      syncTrace: sinon.stub()
    };
    modules = [
      require('./../../fixtures/module/module1'),
      require('./../../fixtures/module/module2'),
      require('./../../fixtures/module/module3'),
      require('./../../fixtures/module/module4')
    ];
    monitor = new Monitor(syncer, db, modules);
  });

  describe('#getModuleList', function () {
    it('returns a list available modules', function (done) {
      db.open.returns(Promise.resolve());
      db.getProgress.returns(Promise.resolve({ modules: [1, 2, 3, 4] }));
      monitor.getModuleList()
        .then(function (modules) {
          assert.deepEqual(modules, [1, 2, 3, 4]);
        })
        .then(done, done);
    });

    it('fetches data from db only once', function (done) {
      db.open.returns(Promise.resolve());
      db.getProgress.returns(Promise.resolve({ modules: [1, 2, 3, 4] }));
      monitor.getModuleList()
        .then(monitor.getModuleList.bind(monitor))
        .then(monitor.getModuleList.bind(monitor))
        .then(function () {
          assert.ok(db.open.calledOnce, 'here');
          assert.ok(db.getProgress.calledOnce, 'there');
        })
        .then(done, done);
    });

    it('builds empty stats if no data is in db', function (done) {
      db.open.returns(Promise.resolve());
      db.getProgress.returns(Promise.resolve(null));
      monitor.getModuleList()
        .then(function (modules) {
          assert.equal(4, modules.length);
          // just test the first module...
          assert.equal(5, modules[0].stepCount);
          assert.equal(0, modules[0].completedSteps);
        })
        .then(done, done);
    });
  });

  describe('#recordTrace', function () {
    it('delegates to syncer', function () {
      var trace = new Trace(1, 2, 'text', true);
      monitor.recordTrace(trace);
      assert.ok(syncer.syncTrace.calledWith(trace));
    });

    it('throws an error if trace is of the wrong type', function () {
      assert.throws(function () {
        monitor.recordTrace('wrong');
      });
    });
  });

  describe('#getModuleInfo', function () {
    it('returns the title and number of steps of a given module', function () {
      assert.deepEqual(
        { title: 'Module 1', stepCount: 5 },
        monitor.getModuleInfo(1)
      );
    });

    it('throws an error if the module cannot be found', function () {
      assert.throws(function () {
        monitor.getModuleInfo(123);
      });
    });
  });

  describe('#getStep', function () {
    it('finds a step of a given module', function () {
      assert.deepEqual(
        { id: 1, type: 'text', data: 'This is some text for step 1...'},
        monitor.getStep(1, 1)
      );
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
