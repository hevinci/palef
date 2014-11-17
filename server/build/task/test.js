var fs = require('fs');
var glob = require('glob');
var browserify = require('browserify')();
var componentBuilder = require('./../component');
var rootDir = __dirname + '/../../..';
var moduleDir = rootDir + '/node_modules';
var testDir = rootDir + '/client/test';
var tgtDir = rootDir + '/public/test';
var vendorDir = tgtDir + '/vendor';

// create test/vendor directory if necessary
if (!fs.existsSync(vendorDir)) fs.mkdirSync(vendorDir);

// copy mocha and sinon dependencies
fs.createReadStream(moduleDir + '/mocha/mocha.css')
  .pipe(fs.createWriteStream(vendorDir + '/mocha.css'));
fs.createReadStream(moduleDir + '/mocha/mocha.js')
  .pipe(fs.createWriteStream(vendorDir + '/mocha.js'));
fs.createReadStream(moduleDir + '/sinon/pkg/sinon.js')
  .pipe(fs.createWriteStream(vendorDir + '/sinon.js'));
fs.createReadStream(moduleDir + '/sinon/pkg/sinon-ie.js')
  .pipe(fs.createWriteStream(vendorDir + '/sinon-ie.js'));

// gather component layouts and store them in a dedicated file
componentBuilder.getLayouts(function (templates) {
  fs.writeFileSync(
    tgtDir + '/templates.js',
    'window.Templates = ' + templates + ';'
  );
});

// bundle tests into one file
glob('**/*.js', { cwd: testDir }, function (err, files) {
  if (err) throw err;

  files.forEach(function (file) {
    browserify.add(testDir + '/' + file);
  });

  browserify.bundle()
    .pipe(fs.createWriteStream(tgtDir + '/bundle.js'));
});
