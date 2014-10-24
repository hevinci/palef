var fs = require('fs');
var dot = require('dot');
var templates = {};

module.exports = function (filePath, options, callback) {
  fs.readFile(filePath, 'utf8', function (err, template) {
    if (err) {
      throw new Error(err);
    }

    if (!templates[filePath]) {
      templates[filePath] = dot.template(template);
    }

    return callback(null, templates[filePath](options));
  })
};
