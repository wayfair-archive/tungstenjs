'use strict';

module.exports = function(contents) {
  this.cacheable();
  return 'module.exports=' + JSON.stringify(contents) + ';';
};