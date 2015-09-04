'use strict';

var ObjectToString = Object.prototype.toString;
/**
 * Check if the object is a native array
 * @param  {Any}     object Any value referenced by a mustache section
 * @return {Boolean}        If the value is an Array
 */
module.exports = function(object) {
  if (Array.isArray) {
    return Array.isArray(object);
  } else {
    return ObjectToString.call(object) === '[object Array]';
  }
};
