var fs = require('fs');
var uglify = require('uglify-js/tools/node');
var dotBuilder = require('./dot');
var stylusBuilder = require('./stylus');
var componentBuilder = require('./component');
var browserifyBuilder = require('./browserify');
var indexPath = __dirname + '/../../public/index.html';
var manifestPath = __dirname + '/../../public/manifest.appcache';
var isProd = false;

// build the application index and its dependencies
// (scripts, templates, css, manifest)
dotBuilder.compile(function (templates) {
  componentBuilder.getLayouts(function (layouts) {
    stylusBuilder.compile(function (stylesheet) {
      browserifyBuilder.compile(function (scripts) {
        fs.writeFileSync(manifestPath, templates.manifest({
          version: new Date().toString()
        }));
        fs.writeFileSync(indexPath, templates.index({
          stylesheet: stylesheet,
          layouts: layouts,
          scripts: isProd ? uglify.minify(scripts, { fromString: true }).code : scripts
        }));
      });
    });
  });
});

