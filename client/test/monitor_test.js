var assert = require('assert');
var Monitor = require('./../src/monitor');

describe('monitor', function () {
  var monitor;
  var modules = [
    require('./../../fixtures/module/module1'),
    require('./../../fixtures/module/module2'),
    require('./../../fixtures/module/module3'),
    require('./../../fixtures/module/module4')
  ];

  beforeEach(function () {
    monitor = new Monitor({}, {}, modules);
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

  describe('#previousStepId', function () {
    it('finds the id of the previous step', function () {
      assert.equal(monitor.previousStepId(1, 2), 1);
    });

    it('throws an error if the module id cannot be found', function () {
      assert.throws(function () {
        monitor.previousStepId(123, 2);
      });
    });

    it('throws an error if the current step id cannot be found', function () {
      assert.throws(function () {
        monitor.previousStepId(1, 234);
      });
    });

    it('returns null if the current step is the first one', function () {
      assert.strictEqual(monitor.previousStepId(1, 1), null);
    });
  });

  describe('#nextStepId', function () {
    it('finds the id of the next step', function () {
      assert.equal(monitor.nextStepId(1, 1), 2);
    });

    it('throws an error if the module id cannot be found', function () {
      assert.throws(function () {
        monitor.nextStepId(123, 2);
      });
    });

    it('throws an error if the current step id cannot be found', function () {
      assert.throws(function () {
        monitor.nextStepId(1, 234);
      });
    });

    it('returns nothing if the current step is the last one', function () {
      assert.strictEqual(monitor.nextStepId(1, 5), null);
    });
  });
});
