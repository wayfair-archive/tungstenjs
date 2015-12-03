'use strict';

var _ = require('underscore');

module.exports = function(contents) {
  this.cacheable();
  if (this.query === '?static') {
    return 'module.exports=' + JSON.stringify(contents) + ';';
  } else if (this.query.substr(0, 9) === '?template') {
    var isPanel = this.resourcePath.indexOf('/debug/panel/info_panels') > -1;
    isPanel = isPanel || this.resourcePath.indexOf('\\debug\\panel\\info_panels') > -1;
    var templateVar = isPanel ? 'panel' : 'w';
    return 'var _=require("underscore");module.exports=' + _.template(contents, {
      variable: templateVar
    }).source + ';';
  }
};
