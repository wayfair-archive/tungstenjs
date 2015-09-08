'use strict';

var ObjectToString = Object.prototype.toString;
/**
 * Check if the object is a native array
 * @param  {Any}     object Any value referenced by a mustache section
 * @return {Boolean}        If the value is an Array
 */

var nativeFn = Array.isArray;
var polyfillFn = function(object) { return ObjectToString.call(object) === '[object Array]'; };
module.exports = nativeFn || polyfillFn;
// only export polyfill if running in node for testing
if (__dirname) {
  module.exports.polyfill = polyfillFn;
}