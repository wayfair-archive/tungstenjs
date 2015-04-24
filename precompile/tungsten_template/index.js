/**
 * Pre-compiles templates using Ractive and returns a module with all dependencies required
 *
 * Copyright 2015 Wayfair, LLC
 * Available under the Apache Version 2.0 License
 *
 * https://github.com/wayfair/tungstenjs
 *
 * @license Apache-2.0
 */
'use strict';
var Ractive = require('ractive');
var _ = require('underscore');
var path = require('path');

var ractiveTypes = require('../../src/template/ractive_types');

/**
 * Ractive does a breaks non-alphanumeric interpolator keys into an object format
 * This reverses the process
 * @param  {Object} template Ractive object to get lookup key from
 * @return {String}          Raw value to lookup from context
 */
function parseInterpolatorString(template) {
  if (template.x) {
    var str = template.x.s;
    str = str.replace(/_(\d)/g, function(fullMatch, match) {
      return template.x.r[match];
    });
    return str;
  } else {
    return template.r || '';
  }
}

/**
 * Find partials so they can be required
 * @param  {Object} template    Template object to parse over
 * @param  {Object} partials    Partials object to add to
 * @return {Object}             Partials referenced in this template
 */
function findPartials(template, partials) {
  partials = partials || {};
  if (typeof template === 'string' || typeof template === 'undefined') {
    // String or undefined means we've bottomed out
    return partials;
  } else if (template instanceof Array) {
    // Arrays need mapping over
    for (var i = 0; i < template.length; i++) {
      findPartials(template[i], partials);
    }
    return partials;
  }

  switch (template.t) {
    // Partial means we found one
    case ractiveTypes.PARTIAL:
      var partialName = parseInterpolatorString(template);
      partials[partialName] = true;
      break;

    // Element or Sections should be iterated into
    case ractiveTypes.ELEMENT:
    case ractiveTypes.SECTION:
      findPartials(template.f, partials);
      break;
  }

  return partials;
}

/**
 * Compiles a template with Ractive
 * Throws exception if template is unable to be parsed
 * @param  {String} contents  Contents of template file
 * @param  {String} srcFile   Path to template file
 * @return {Object}           Rendered template object
 */
function compileTemplate(contents, srcFile) {
  var parsed;
  try {
    parsed = Ractive.parse(contents, {
      preserveWhitespace: true
    });
  } catch (ex) {
    console.log('Unable to parse ' + (srcFile || contents));
    console.log(ex.message);
    process.exit(1);
  }

  return parsed.t;
}

/**
 * Compiles given templates
 * @param  {String} contents Root directory of templates to get stripped off partials
 */
module.exports = function(contents) {
  this.cacheable();
  var parsedTemplate = compileTemplate(contents, module.src);
  var partials = findPartials(parsedTemplate);
  var template = JSON.stringify(parsedTemplate);

  var templatePath = path.relative(path.dirname(module.dest), __dirname + '/template');
  templatePath = templatePath.replace(/\\/g, '/');

  var output = 'var Template=require("tungstenjs/src/template/template");';
  output += 'var template=new Template(' + template + ');';
  output += 'module.exports=template;';
  if (_.size(partials) > 0) {
    output += 'template.setPartials({';
    output += _.map(partials, function(v, partial) {
      return '"' + partial + '":require("./' + partial + '.mustache")';
    }).join(',');
    output += '});';
  }

  return output;
};
