/**
 * Forked from https://github.com/deepsweet/istanbul-instrumenter-loader@0.1.3
 */

'use strict';

var istanbul = require('istanbul');
var path = require('path');

var root = path.join(__dirname, '../../../');
var skipInstrumenting = [
  './node_modules',
  './test',
  './src/debug'
].map(function(filePath) {
  return path.join(root, filePath);
});

function ignoreContent(source) {
  return '/* istanbul ignore next */\n(function() {\n' + source + '\n}());';
}

module.exports = function(source) {
  var versionMatch = this.query.match(/(\?|&)version=([^&]+)/);
  var versionVar = (versionMatch && versionMatch[2]) || '';
  var instrumenter = new istanbul.Instrumenter({
    coverageVariable: '__coverage__',
    embedSource: true,
    noAutoWrap: true
  });
  var filePath = this.resourcePath;

  if (/\.json$/.test(filePath)) {
    return ignoreContent(source);
  }

  for (var i = 0; i < skipInstrumenting.length; i++) {
    var folderPath = skipInstrumenting[i];
    if (filePath.substr(0, folderPath.length) === folderPath) {
      return ignoreContent(source);
    }
  }

  if (this.cacheable) {
    this.cacheable();
  }

  var claimedPath = filePath.replace(/\.js$/, '.' + versionVar + '.js');
  return instrumenter.instrumentSync(source, path.relative(root, claimedPath));
};
