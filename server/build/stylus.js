var fs = require('fs');
var stylus = require('stylus');

/**
 * Compiles stylus files into css and executes the given callback
 * with the resulting string.
 *
 * @param indexFile
 * @param callback
 */
module.exports.compile = function (indexFile, callback) {
  stylus(fs.readFileSync(indexFile, 'utf8'))
    .set('filename', indexFile)
    .set('paths', [__dirname + '/../../client/style'])
    .render(function (err, css) {
      if (err) throw err;
      callback(css);
    });
};
