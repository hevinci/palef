var fs = require('fs');
var stylus = require('stylus');
var mainFile = 'main.styl';
var mainFilePath = __dirname + '/../../client/style/' + mainFile;
var mainContent = fs.readFileSync(mainFilePath, 'utf8');

/**
 * Compiles stylus files into css and executes the given callback
 * with the resulting string.
 *
 * @param callback
 */
module.exports.compile = function (callback) {
  stylus(mainContent)
    .set('filename', mainFilePath)
    .set('paths', [__dirname + '/../../client/style'])
    .render(function (err, css) {
      if (err) throw err;
      callback(css);
    });
};