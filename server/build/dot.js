var fs = require('fs');
var dot = require('dot');
var glob = require('glob');
var indexTemplate = __dirname + '/../template/index.dot';
var manifestTemplate = __dirname + '/../template/manifest.dot';
var templateDir = __dirname + '/../../client/template';

/**
 * Compiles doT templates and executes the given callback with
 * an object containing:
 *   1) the main index template (function)
 *   2) the template fragments (serialized object)
 *   3) the application cache manifest (function)
 */
module.exports.compile = function (callback) {
  glob('**/*.dot', { cwd: templateDir }, function (err, files) {
    if (err) throw err;
    var compiled = [];
    files.forEach(function (file) {
      var content = fs.readFileSync(templateDir + '/' + file, 'utf8');
      var extName = file.split('/').pop();
      var name = extName.substring(0, extName.lastIndexOf('.'));
      var body = dot.compile(content).toString().replace('anonymous', '');
      compiled.push("'" + name + "': " + body);
    });
    dot.templateSettings.strip = false;
    var index = dot.template(fs.readFileSync(indexTemplate, 'utf8'));
    var manifest = dot.template(fs.readFileSync(manifestTemplate, 'utf8'));
    dot.templateSettings.strip = true;
    callback({
      index: index,
      fragments: "{\n" + compiled.join(",\n") + '};',
      manifest: manifest
    });
  });
};

