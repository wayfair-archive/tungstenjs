/* eslint-env node */
'use strict';

var markdownCompiler = require('./markdown_compiler');
var _ = require('underscore');
var compiledTemplates = require('./get_mustache_templates');
var file = require('./file');

var doctype = '<!doctype html>';

module.exports = function(bundleMap) {
  _.each(global.config.pages, function(page, name) {
    var content = '';
    if (page.src) {
      var fileContent = file.read(page.src);
      content = markdownCompiler(fileContent);
    }
    var data = _.extend({}, global.config.pageData, page, {
      content: content,
      js: bundleMap[page.js],
      css: bundleMap[page.css]
    });
    file.write(name + '.html', doctype + compiledTemplates[global.config.pageTemplate].toString(data));
  });
};
