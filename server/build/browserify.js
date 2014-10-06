var fs = require('fs');
var browserify = require('browserify')();
var indexFile = __dirname + '/../../client/src/index.js';

/**
 * Bundles production scripts into one string and passes
 * the result to the given callback.
 *
 * @param callback
 */
module.exports.compile = function (callback) {
  var compiled = '';
  var stream = browserify.add(indexFile).bundle();
  stream.on('data', function (buffer) {
    compiled += buffer.toString('utf8');
  });
  stream.on('end', function () {
    callback(compiled);
  });
};
