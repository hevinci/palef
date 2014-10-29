// add global promise polyfill in browsers
require('es6-promise').polyfill();
require('document-register-element');
require('./component/app-palef');

var app = document.createElement('app-palef');
var db = require('./database');
var http = require('./http');
var Syncer = require('./syncer');
var Monitor = require('./monitor');
var Router = require('./router');
var router = new Router();
var syncer = new Syncer(db, http, true);
var monitor = new Monitor(syncer, db, [
  require('./../../fixtures/module/module1'),
  require('./../../fixtures/module/module2'),
  require('./../../fixtures/module/module3'),
  require('./../../fixtures/module/module4')
]);

syncer.syncedCallback = monitor.onServerProgress.bind(monitor);
app.traceCallback = syncer.syncTrace.bind(syncer);
app.setMonitor(monitor);
document.body.appendChild(app);

router.add(/^#modules\/*$/, function () {
  app.listModules();
});
router.add(/^#modules\/(\d+)\/*$/, function (id) {
  app.displayStep(parseInt(id), 1);
});
router.add(/^#modules\/(\d+)\/steps\/(\d+)*$/, function (moduleId, stepId) {
  app.displayStep(parseInt(moduleId), parseInt(stepId));
});
router.add(/.*/, function () {
  app.listModules();
});

router.start();
syncer.syncAll();
