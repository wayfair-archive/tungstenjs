'use strict';

var path = require('path');
var inlineArgsPattern = /^\s+(var|let)\s+(.+?)\s*=\s*INLINE_ARGUMENTS;$/gm;
var lazyRequirePattern = /lazyRequire\(['"](.+?)['"]\)/g;
var lazyRequireFnPattern = /lazyRequireFn\(['"](.+?)['"]\)/g;
var lazyRequireConstructorPattern = /lazyRequireConstructor\(['"](.+?)['"]\)/g;

/**
 * Replaces a uses of INLINE_ARGUMENTS with inlined copy functionality
 */
module.exports = function(contents) {
  this.cacheable();
  var replacedContents = contents;
  replacedContents = replacedContents.replace(inlineArgsPattern, function(match, type, assignTo) {
    return type + ' ' + assignTo + ' = new Array(arguments.length);' +
      'for (let _i = 0; _i < ' + assignTo + '.length; _i++) {' +
          assignTo + '[_i] = arguments[_i];' +
      '}';
  });

  var dir = path.dirname(this.resourcePath);
  replacedContents = replacedContents.replace(lazyRequirePattern, function(match, requiring) {
    var absolutePath = encodeURIComponent(path.join(dir, requiring));
    return 'require("lazy_initializer?request=' + absolutePath + '!' + requiring + '")';
  });

  replacedContents = replacedContents.replace(lazyRequireFnPattern, function(match, requiring) {
    var absolutePath = encodeURIComponent(path.join(dir, requiring));
    return 'require("lazy_initializer?fn=true&request=' + absolutePath + '!' + requiring + '")';
  });

  replacedContents = replacedContents.replace(lazyRequireConstructorPattern, function(match, requiring) {
    var absolutePath = encodeURIComponent(path.join(dir, requiring));
    return 'require("lazy_initializer?constructorFn=true&request=' + absolutePath + '!' + requiring + '")';
  });

  return replacedContents + ';if (!global.counter) {global.counter=0}console.log(' + JSON.stringify(this.resourcePath) + ', "loaded", ++global.counter);';
};
