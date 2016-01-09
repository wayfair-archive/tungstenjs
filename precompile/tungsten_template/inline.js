'use strict';

var _ = require('underscore');
// Override normalize because reasons
// https://github.com/tmpvar/jsdom/issues/769
String.prototype.normalize = null;

var compiler = require('../../src/template/compiler');

function compile(contents, partials) {
  var template = compiler(contents).template;

  if (_.size(partials) > 0) {
    var partialMap = {};
    _.each(partials, function(content, name) {
      partialMap[name] = compiler(content).template;
    });
    template.setPartials(partialMap);
  }

  return template;
}

module.exports = compile;
