'use strict';

var hogan = require('hogan.js');

module.exports = function(contents) {
  this.cacheable();
  return 'var hogan=require("hogan.js");' +
    'module.exports=new hogan.Template(' + hogan.compile(contents, {asString: true}) + ');';
};