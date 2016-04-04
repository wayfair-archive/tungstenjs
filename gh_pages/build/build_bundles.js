/* eslint-env node */
'use strict';

var _ = require('underscore');
var UglifyJs = require('uglify-js');
var cssmin = require('cssmin');
var file = require('./file');
var flags = require('./flags');

var delimiters = {
  '.js': '\n'
};
var minifiers = {
  '.js': uglify,
  '.css': cssmin
};

function uglify(input) {
  return UglifyJs.minify(input, {
    fromString: true
  }).code;
}

module.exports = function() {
  var bundleMap = {};
  _.each(global.config.bundles, function(contents, name) {
    var lastTime = 0;
    var output = '';
    var ext = file.extension(name);
    for (var i = 0; i < contents.length; i++) {
      lastTime = Math.max(lastTime, file.mtime(contents[i]));
      output += file.read(contents[i]);
      if (delimiters[ext]) {
        output += delimiters[ext];
      }
    }
    if (!flags.dev && minifiers[ext]) {
      output = minifiers[ext](output);
    }

    var outputName = name.replace(new RegExp(ext + '$'), '.' + lastTime + ext);
    bundleMap[name] = outputName;
    file.write(outputName, output);
  });
  return bundleMap;
};
