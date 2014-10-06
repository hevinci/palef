var fs = require('fs');
var dotBuilder = require('./dot');
var stylusBuilder = require('./stylus');
var browserifyBuilder = require('./browserify');
var outputPath = __dirname + '/../../public/index.html';

// build the application index and its dependencies
// (scripts, templates, css)
dotBuilder.compile(function (templates) {
  stylusBuilder.compile(function (stylesheet) {
    browserifyBuilder.compile(function (scripts) {
      fs.writeFileSync(outputPath, templates.index({
        stylesheet: stylesheet,
        templates: templates.fragments,
        scripts: scripts
      }));
    });
  });
});
