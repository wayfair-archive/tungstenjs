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

var _ = require('underscore');
var compiler = require('../../src/template/compiler');

/**
 * Compiles given templates
 * @param  {String} contents Root directory of templates to get stripped off partials
 */
module.exports = function(contents) {
  this.cacheable();
  var templateData = compiler(contents);

  var output = 'var Template=require("tungstenjs").Template;';
  output += 'var template=new Template(' + JSON.stringify(templateData.templateObj) + ');';
  output += 'module.exports=template;';
  var partials = templateData.tokens.partials;
  if (partials.length > 0) {
    output += 'template.setPartials({';
    output += _.map(partials, function(partial) {
      return '"' + partial + '":require("./' + partial + '.mustache")';
    }).join(',');
    output += '});';
  }

  return output;
};
