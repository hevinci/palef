// add global promise polyfill in browsers
require('es6-promise').polyfill();

var Router = require('./router');
var ModulePlayer = require('./module/player');
var router = new Router();

var modules = [
  require('./../../fixtures/module/module1'),
  require('./../../fixtures/module/module2'),
  require('./../../fixtures/module/module3'),
  require('./../../fixtures/module/module4')
];

var modulePlayer = new ModulePlayer(
  document.getElementById('container'),
  modules
);

router.add(/^#modules\/*$/, function () {
  modulePlayer.list();
});
router.add(/^#modules\/(\d+)\/*$/, function (id) {
  modulePlayer.showStep(parseInt(id), 1);
});
router.add(/^#modules\/(\d+)\/steps\/(\d+)*$/, function (moduleId, stepId) {
  modulePlayer.showStep(parseInt(moduleId), parseInt(stepId));
});
router.add(/.*/, function () {
  modulePlayer.list();
});

router.start();
