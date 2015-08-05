'use strict';

var _ = require('underscore');
var FocusHook = require('./hooks/focus_hook');

/**
 * Map of attribute to property transforms
 * Templates use attribute name, but virtual-dom references properties first
 * @type {Object}
 */
var propertiesToTransform = {
  // transformed name
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv',
  // case specificity
  'accesskey': 'accessKey',
  'autocomplete': 'autoComplete',
  'autoplay': 'autoPlay',
  'colspan': 'colSpan',
  'contenteditable': 'contentEditable',
  'contextmenu': 'contextMenu',
  'enctype': 'encType',
  'formnovalidate': 'formNoValidate',
  'hreflang': 'hrefLang',
  'novalidate': 'noValidate',
  'readonly': 'readOnly',
  'rowspan': 'rowSpan',
  'spellcheck ': 'spellCheck',
  'srcdoc': 'srcDoc',
  'srcset': 'srcSet',
  'tabindex': 'tabIndex'
};
/**
 * Returns property name to use or false if it should be treated as attribute
 * @param  {String}         attributeName Attribute to assign
 * @return {String|Boolean}               False if it should be an attribute, otherwise property name
 */
function transformPropertyName(attributeName) {
  if (propertiesToTransform[attributeName]) {
    return propertiesToTransform[attributeName];
  }
  // Data attributes are a special case..
  // Persisting them as attributes as they are often accessed via jQuery (i.e. data-click-location)
  // Use the nested attributes hash to avoid datasets because IE
  if (attributeName.substr(0, 5) === 'data-') {
    return false;
  }
  return attributeName;
}

module.exports = function processProperties(properties, attributesOnly) {
  // Attribute only mode is only used for the toString method, so no processing is needed
  if (attributesOnly) {
    return {
      attributes: properties
    };
  }

  var propertyNames = _.keys(properties);
  var result = {};

  // Defaulting contentEditable to 'inherit'
  // If an element goes from an explicitly set value to null, it will use this value rather than error
  var hasContentEditable = false;
  for (var i = 0; i < propertyNames.length; i++) {
    if (propertyNames[i].toLowerCase() === 'contenteditable') {
      hasContentEditable = true;
      break;
    }
  }

  if (!hasContentEditable) {
    result.contentEditable = 'inherit';
  }

  for (i = 0; i < propertyNames.length; i++) {
    var propName = propertyNames[i];
    var lowerPropName = propName.toLowerCase();
    var transformedName = transformPropertyName(lowerPropName);
    if (transformedName === false) {
      if (!result.attributes) {
        result.attributes = {};
      }
      result.attributes[propName] = properties[propName];
    } else if (lowerPropName === 'autofocus') {
      result.autofocus = new FocusHook();
    } else if (lowerPropName === 'style') {
      var rules = {};
      if (typeof properties[propName] === 'string') {
        // Handle parsing style tags into CSS rules
        // @TODO: expand parsing to avoid "changing" all rules whenever any rule changes
        rules = {
          cssText: properties[propName]
        };
      } else {
        rules = properties[propName];
      }
      result.style = rules;
    } else {
      result[transformedName] = properties[propName];
    }
  }

  return result;
};