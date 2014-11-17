var fs = require('fs');
var browserifyBuilder = require('./../browserify');
var stylusBuilder = require('./../stylus');
var rootDir =  __dirname + '/../../..';
var publicDir = rootDir + '/public';
var indexFile = rootDir + '/client/src/editor/editor.js';
var stylusIndex = rootDir + '/client/style/editor/index.styl';
var scriptDir = publicDir + '/script';

if (!fs.existsSync(scriptDir)) fs.mkdirSync(scriptDir);

browserifyBuilder.compile(indexFile, function (compiled) {
  fs.writeFileSync(scriptDir + '/editor.js', compiled);
  stylusBuilder.compile(stylusIndex, function (compiled) {
    fs.writeFileSync(publicDir + '/css/editor.css', compiled);
  });
});