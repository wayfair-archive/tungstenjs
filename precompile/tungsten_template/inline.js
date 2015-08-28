'use strict';

var _ = require('underscore');
var path = require('path');
// Override normalize because reasons
// https://github.com/tmpvar/jsdom/issues/769
String.prototype.normalize = null;

var utils = require('./shared_utils');
var fs = require('fs');
var Template = require('../../src/template/template');

require.extensions['.mustache'] = function(module, filename) {
  var contents = fs.readFileSync(filename, 'utf8');
  var parsedTemplate = utils.compileTemplate(contents, module.src);
  var partials = utils.findPartials(parsedTemplate);
  utils.handleDynamicComments(parsedTemplate);
  var template = new Template(parsedTemplate);

  module.exports = template;

  if (_.size(partials) > 0) {
    var dirname = path.dirname(filename);
    var partialMap = {};
    _.each(partials, function(v, partial) {
      partialMap[partial] = require(path.join(dirname, partial + '.mustache'));
    });
    template.setPartials(partialMap);
  }
};

function compile(contents, partials) {
  var parsedTemplate = utils.compileTemplate(contents, module.src);
  utils.handleDynamicComments(parsedTemplate);
  var template = new Template(parsedTemplate);

  if (_.size(partials) > 0) {
    var partialMap = {};
    _.each(partials, function(content, name) {
      partialMap[name] = compile(content);
    });
    template.setPartials(partialMap);
  }

  return template;
}

module.exports = compile;
