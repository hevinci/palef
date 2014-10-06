var fs = require('fs');
var glob = require('glob');
var browserify = require('browserify')();
var dotBuilder = require('./dot');
var mochaDir = __dirname + '/../../node_modules/mocha';
var testDir = __dirname + '/../../client/test';
var tgtDir = __dirname + '/../../public/test';
var vendorDir = tgtDir + '/vendor';

// create test/vendor directory if necessary
if (!fs.existsSync(vendorDir)) fs.mkdirSync(vendorDir);

// copy mocha's dependencies
fs.createReadStream(mochaDir + '/mocha.css')
  .pipe(fs.createWriteStream(vendorDir + '/mocha.css'));
fs.createReadStream(mochaDir + '/mocha.js')
  .pipe(fs.createWriteStream(vendorDir + '/mocha.js'));

// compile doT templates and store them in a dedicated file
dotBuilder.compile(function (templates) {
  fs.writeFileSync(
    tgtDir + '/templates.js',
    'window.Templates = ' + templates.fragments
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
