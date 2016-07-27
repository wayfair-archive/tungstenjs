/**
 * Pre-compiles templates using Ractive and returns a module with all dependencies required
 *
 * Copyright 2016 Wayfair, LLC
 * Available under the Apache Version 2.0 License
 *
 * https://github.com/wayfair/tungstenjs
 *
 * @license Apache-2.0
 */
'use strict';

var path = require('path');
var compilerFn = require('lazy_initializer!../../src/template/compiler');

/**
 * Compiles given templates
 * @param  {String} contents Root directory of templates to get stripped off partials
 */
module.exports = function(contents) {
  this.cacheable();
  var compiler = compilerFn();
  var templateData = compiler(contents);

  var templatePath = path.relative(path.dirname(module.dest), __dirname + '/template');
  templatePath = templatePath.replace(/\\/g, '/');

  var output = 'var Template=require("tungstenjs").Template;';
  output += 'var template=new Template(' + JSON.stringify(templateData.templateObj) + ');';
  output += 'module.exports=template;';
  var partials = templateData.tokens.partials;
  if (partials.length > 0) {
    output += 'template.setPartials({';
    output += partials.map(function(partial) {
      return '"' + partial + '":require("./' + partial + '.mustache")';
    }).join(',');
    output += '});';
  }

  return output;
};
