var fs = require('fs');
var glob = require('glob');
var browserify = require('browserify')();
var mochaDir = __dirname + '/../../node_modules/mocha';
var testDir = __dirname + '/../../client/test';
var publicDir = __dirname + '/../../public';
var tgtDir = publicDir + '/test';
var vendorDir = tgtDir + '/vendor';

if (!fs.existsSync(vendorDir)) fs.mkdirSync(vendorDir);

fs.createReadStream(mochaDir + '/mocha.css')
  .pipe(fs.createWriteStream(vendorDir + '/mocha.css'));
fs.createReadStream(mochaDir + '/mocha.js')
  .pipe(fs.createWriteStream(vendorDir + '/mocha.js'));

glob('**/*.js', { cwd: testDir }, function (err, files) {
  if (err) throw err;

  files.forEach(function (file) {
    browserify.add(testDir + '/' + file);
  });

  browserify.bundle()
    .pipe(fs.createWriteStream(tgtDir + '/bundle.js'));
});
