'use strict';
var _ = require('underscore');
var template = require('../../src/template/template.js');
function compileTemplates(rawTemplates) {
  var compiledTemplates = {}, partialsList = {}, rawTemplates = rawTemplates || {};
  var templateNames = Object.keys(rawTemplates);

  function parseTemplates(rawTemplates, templateNames, compiledTemplates) {
    for (var i = 0; i < templateNames.length; i++) {
      var parsed = Ractive.parse(rawTemplates[templateNames[i]], {
        stripComments: false,
        preserveWhitespace: true
      });
      compiledTemplates[templateNames[i]] = new template(parsed.t, partialsList);
    }
  }

  // Compile templates as partials
  parseTemplates(rawTemplates, templateNames, compiledTemplates);
  _.keys(rawTemplates).forEach(function(item) {
    partialsList[item] = compiledTemplates[item];
  });
  // Reparse templates with partials
  parseTemplates(rawTemplates, templateNames, compiledTemplates);
  return compiledTemplates;
}
module.exports = {compileTemplates: compileTemplates};
