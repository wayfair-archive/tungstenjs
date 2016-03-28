/* eslint-env node */
'use strict';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var glob = require('glob');

function inputPath(file) {
  return path.join(__dirname, '..', file);
}
function outputPath(file) {
  return path.join(__dirname, '..', global.config.outputDir, file);
}

module.exports.find = function(pattern) {
  return glob.sync(path.join(__dirname, '..', pattern));
};

module.exports.read = function(file) {
  return fs.readFileSync(inputPath(file)).toString();
};

module.exports.write = function(file, contents) {
  var dest = outputPath(file);
  mkdirp.sync(path.dirname(dest));
  console.log('Writing file: ' + file);
  fs.writeFileSync(dest, contents);
};

module.exports.mtime = function(file) {
  return fs.statSync(inputPath(file)).mtime;
};

module.exports.extension = function(file) {
  return path.extname(file);
};
