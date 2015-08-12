'use strict';

var hogan = require('hogan.js');

module.exports = function(contents) {
  this.cacheable();
  if (this.query === '?static') {
    return 'module.exports=' + JSON.stringify(contents) + ';';
  } else if (this.query === '?template') {
    return 'var hogan=require("hogan.js");' +
      'module.exports=new hogan.Template(' + hogan.compile(contents, {asString: true}) + ');';
  }
};
