/* eslint-env node */
/* eslint-disable no-console */
'use strict';

var glob = require('glob');
var path = require('path');
var webpack = require('webpack');
var npm = require('global-npm');

function bytesToSize(bytes) {
  var sizes = ['bytes', 'kb', 'mb'];
  if (bytes === 0) {
    return '0 bytes';
  }
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
function getErrorString(err, stats) {
  var errStr = err;
  if (!err && stats.compilation.errors.length) {
    errStr = stats.compilation.errors.map(function (err) {
      return err.message;
    }).join('\n');
  }
  var timeStr = '';


  if (stats && stats.compilation && !errStr) {
    Object.keys(stats.compilation.assets).forEach(function(asset) {
      timeStr += asset + ': ' + bytesToSize(stats.compilation.assets[asset].size()) + '\n';
    });
  }
  return errStr || 'No errors: \n' + timeStr;
}

npm.load(function() {
  glob(path.join(__dirname, '*', 'webpack.config.js'), function(err, matches) {
    matches.forEach(function(match) {
      var config = require(match);
      if (typeof config === 'function') {
        config = config();
      }
      var folder = path.dirname(match);
      var folderName = path.basename(folder);
      // run an `npm install` first
      npm.commands.install(folder, [], function() {
        // Correct the entry point for the different directory
        config.entry = path.resolve(folder, config.entry);
        webpack(config, function(err, stats) {
          console.log(folderName + ' finished building', getErrorString(err, stats));
        });
      });
    });
  });
});
