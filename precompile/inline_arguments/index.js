'use strict';

var inlineArgsPattern = /^\s+(var|let)\s+(.+?)\s*=\s*INLINE_ARGUMENTS;$/gm;

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

  return replacedContents + ';if (!global.counter) {global.counter=0}console.log(' + JSON.stringify(this.resourcePath) + ', "loaded", ++global.counter);';
};
