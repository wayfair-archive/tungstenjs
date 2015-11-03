'use strict';

var _ = require('underscore');
var Ractive = require('ractive');
var logger = require('../../src/utils/logger');
var ractiveTypes = require('../../src/template/ractive_types');

/**
 * Ractive does a breaks non-alphanumeric interpolator keys into an object format
 * This reverses the process
 * @param  {Object} template Ractive object to get lookup key from
 * @return {String}          Raw value to lookup from context
 */
module.exports.parseInterpolatorString = function(template) {
  if (!template) {
    return '';
  }
  if (template.x) {
    var str = template.x.s;
    str = str.replace(/_(\d)/g, function(fullMatch, match) {
      return template.x.r[match];
    });
    return str;
  } else {
    return template.r || '';
  }
};

/**
 * Find partials so they can be required
 * @param  {Object} template    Template object to parse over
 * @param  {Object} partials    Partials object to add to
 * @return {Object}             Partials referenced in this template
 */
function _findPartials(template, partials) {
  if (typeof template === 'string' || typeof template === 'undefined') {
    // String or undefined means we've bottomed out
    return;
  } else if (template instanceof Array || template == null) {
    // Arrays need mapping over
    for (var i = 0; i < template.length; i++) {
      _findPartials(template[i], partials);
    }
    return;
  }

  switch (template.t) {
    // Partial means we found one
    case ractiveTypes.PARTIAL:
      var partialName = module.exports.parseInterpolatorString(template);
      partials[partialName] = true;
      break;

      // Element or Sections should be iterated into
    case ractiveTypes.ELEMENT:
    case ractiveTypes.SECTION:
      _findPartials(template.f, partials);
      break;
  }
}

module.exports.findPartials = function(template) {
  var partials = {};
  _findPartials(template, partials);
  return _.keys(partials);
};

/**
 * Compiles a template with Ractive
 * Throws exception if template is unable to be parsed
 * @param  {String} contents  Contents of template file
 * @param  {String} srcFile   Path to template file
 * @return {Object}           Rendered template object
 */
module.exports.compileTemplate = function(contents, srcFile) {
  var parsed;
  try {
    parsed = Ractive.parse(contents, {
      stripComments: false,
      preserveWhitespace: true
    });
  } catch (ex) {
    logger.error('Unable to parse ' + (srcFile || contents));
    throw new Error('Compilation error: ' + ex.message);
  }

  return parsed.t;
};

module.exports.handleSvg = function(template, inSVG) {
  if (typeof template === 'string' || typeof template === 'undefined') {
    // String or undefined means we've bottomed out
    return;
  } else if (template instanceof Array) {
    // Arrays need mapping over
    for (var i = 0; i < template.length; i++) {
      module.exports.handleSvg(template[i], inSVG);
    }
    return;
  }

  switch (template.t) {

    case ractiveTypes.SECTION:
      module.exports.handleSvg(template.f, inSVG || template.e === 'svg');
      break;
    case ractiveTypes.ELEMENT:
      if (!inSVG && template.e === 'svg') {
        inSVG = true;
      }
      if (inSVG) {
        if (!template.a) {
          template.a = {};
        }
        template.a.namespace = 'http://www.w3.org/2000/svg';
      }
      module.exports.handleSvg(template.f, inSVG);
      break;
  }

  return;
};

module.exports.handleDynamicComments = function(template) {
  if (typeof template === 'string' || typeof template === 'undefined') {
    // String or undefined means we've bottomed out
    return;
  } else if (template instanceof Array) {
    // Arrays need mapping over
    for (var i = 0; i < template.length; i++) {
      module.exports.handleDynamicComments(template[i]);
    }
    return;
  }

  switch (template.t) {
    // Comment means we found one
    case ractiveTypes.COMMENT:
      var parsed = Ractive.parse(template.c, {
        stripComments: false,
        preserveWhitespace: true
      });
      template.c = parsed.t;
      break;

      // Element or Sections should be iterated into
    case ractiveTypes.ELEMENT:
    case ractiveTypes.SECTION:
      module.exports.handleDynamicComments(template.f);
      break;
  }

  return;
};
