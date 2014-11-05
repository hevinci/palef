// add global promise polyfill in browsers
require('es6-promise').polyfill();

var App = require('./app');
var Syncer = require('./syncer');
var Monitor = require('./monitor');
var Router = require('./router');
var db = require('./database');
var http = require('./http');
var router = new Router();
var syncer = new Syncer(db, http, true);
var monitor = new Monitor(syncer, db, [
  require('./../../fixtures/module/module1'),
  require('./../../fixtures/module/module2'),
  require('./../../fixtures/module/module3'),
  require('./../../fixtures/module/module4'),
  require('./../../fixtures/module/module5'),
  require('./../../fixtures/module/module6'),
  require('./../../fixtures/module/module7'),
  require('./../../fixtures/module/module8'),
  require('./../../fixtures/module/module9'),
  require('./../../fixtures/module/module10'),
  require('./../../fixtures/module/module11')
]);
var app = new App(monitor);

syncer.syncedCallback = monitor.onServerProgress.bind(monitor);

router.add(/^#\/modules\/*$/, function () {
  app.displayHomepage();
});
router.add(/^#\/modules\/(\d+)\/*$/, function (id) {
  app.displayStep(parseInt(id), 1);
});
router.add(/^#\/modules\/(\d+)\/steps\/(\d+)*$/, function (moduleId, stepId) {
  app.displayStep(parseInt(moduleId), parseInt(stepId));
});
router.add(/.*/, function () {
  app.displayHomepage();
});

router.start();
syncer.syncAll();
