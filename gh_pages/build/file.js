/* eslint-env node */
/* eslint-disable no-console */
'use strict';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var glob = require('glob');
var pathIsAbsolute = require('path-is-absolute');

var doctype = '<!doctype html>';

function inputPath(file) {
  return path.join(__dirname, '..', file);
}
function outputPath(file) {
  return path.join(__dirname, '..', global.config.outputDir, file);
}

module.exports.outputPath = outputPath;

module.exports.find = function(pattern) {
  return glob.sync(path.join(__dirname, '..', pattern));
};

module.exports.read = function(file) {
  var source;
  if (pathIsAbsolute(file)) {
    source = file;
  } else {
    source = inputPath(file);
  }
  var sourceStats = fs.lstatSync(source);
  if (sourceStats.isDirectory()) {
    throw 'Cannot read directory. Check path: ' + source;
  } else {
    return fs.readFileSync(source).toString();
  }
};

module.exports.write = function(file, contents) {
  var dest;
  if (pathIsAbsolute(file)) {
    dest = file;
  } else {
    dest = outputPath(file);
  }
  mkdirp.sync(path.dirname(dest));
  console.log('Writing file: ' + file);
  fs.writeFileSync(dest, contents);
};

module.exports.writeHtml = function(file, contents) {
  module.exports.write(file, doctype + contents);
};

module.exports.mtime = function(file) {
  return fs.statSync(inputPath(file)).mtime;
};

module.exports.extension = function(file) {
  return path.extname(file);
};
