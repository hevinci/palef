var fs = require('fs');
var dotBuilder = require('./dot');
var stylusBuilder = require('./stylus');
var browserifyBuilder = require('./browserify');
var indexPath = __dirname + '/../../public/index.html';
var manifestPath = __dirname + '/../../public/manifest.appcache';

// build the application index and its dependencies
// (scripts, templates, css, manifest)
dotBuilder.compile(function (templates) {
  stylusBuilder.compile(function (stylesheet) {
    browserifyBuilder.compile(function (scripts) {
      fs.writeFileSync(manifestPath, templates.manifest({
        version: new Date().toString()
      }));
      fs.writeFileSync(indexPath, templates.index({
        stylesheet: stylesheet,
        templates: templates.fragments,
        scripts: scripts
      }));
    });
  });
});
