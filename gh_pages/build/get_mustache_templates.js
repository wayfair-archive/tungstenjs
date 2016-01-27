'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var templateCompiler = require('../../precompile/tungsten_template/template_helper');
var glob = require('glob');

var Context = require('../../src/template/template_context');
Context.setAdapterFunctions({
  initialize: function(view, parentContext) {
    if (view == null) {
      view = {};
    }
    this.parent = parentContext;
  },
  lookupValue: function(view, name) {
    var value = null;
    if (view && view[name] != null) {
      value = view[name];
    }
    return value;
  }
});

var templateFolder = path.join(__dirname, '../templates');
var templatesFiles = glob.sync(path.join(templateFolder, '/**/*.mustache'));
var templateMap = {};
_.each(templatesFiles, function(template) {
  template = path.normalize(template);
  var name = template.replace(templateFolder + path.sep, '').replace(/\.mustache$/, '');
  templateMap[name] = fs.readFileSync(template).toString();
});
module.exports = templateCompiler.compileTemplates(templateMap);
