var fs = require('fs');
var glob = require('glob');
var minify = require('html-minifier').minify;
var componentDir = __dirname + '/../../client/src/component';
var templates = {};

/**
 * Gathers component layouts and passes a JSON representation
 * of them to given callback.
 */
module.exports.getLayouts = function (callback) {
  glob('**/*.html', { cwd: componentDir }, function (err, files) {
    if (err) throw err;

    files.forEach(function (file) {
      var name =  file.match(/(.+)\.html$/)[1];
      var content = fs.readFileSync(componentDir + '/' + file, 'utf8');
      templates[name] = minify(content, {
        removeComments: true,
        collapseWhitespace: true
      });
    });

    callback(JSON.stringify(templates));
  });
};
