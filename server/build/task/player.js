var fs = require('fs');
var uglify = require('uglify-js/tools/node');
var cleanCss = require('clean-css');
var dotBuilder = require('./../dot');
var stylusBuilder = require('./../stylus');
var componentBuilder = require('./../component');
var browserifyBuilder = require('./../browserify');
var rootDir =  __dirname + '/../../..';
var publicDir = rootDir + '/public';
var indexFile = rootDir + '/client/src/player/index.js';
var stylusIndex = rootDir + '/client/style/player/index.styl';
var isProd = false;

// build the application index and its dependencies
// (scripts, templates, css, manifest)
dotBuilder.compile(function (templates) {
  componentBuilder.getLayouts(function (layouts) {
    stylusBuilder.compile(stylusIndex, function (stylesheet) {
      browserifyBuilder.compile(indexFile, function (scripts) {
        fs.writeFileSync(publicDir + '/manifest.appcache', templates.manifest({
          version: new Date().toString()
        }));
        fs.writeFileSync(publicDir + '/index.html', templates.index({
          layouts: layouts,
          stylesheet: isProd ? new cleanCss().minify(stylesheet) : stylesheet,
          scripts: isProd ? uglify.minify(scripts, { fromString: true }).code : scripts
        }));
      });
    });
  });
});

