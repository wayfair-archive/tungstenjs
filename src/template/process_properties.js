'use strict';

var _ = require('underscore');

/** @type {Object} Whitelist of properties. All others are treated as attributes */
var nonTransformedProperties = {
  'accept': true,
  'action': true,
  'alt': true,
  'async': true,
  'autocapitalize': true,
  'autocomplete': true,
  'autocorrect': true,
  'autoplay': true,
  'checked': true,
  'content': true,
  'controls': true,
  'data': true,
  'dataset': true,
  'defer': true,
  'dir': true,
  'download': true,
  'draggable': true,
  'enctype': true,
  'href': true,
  'hreflang': true,
  'icon': true,
  'id': true,
  'label': true,
  'lang': true,
  'list': true,
  'loop': true,
  'max': true,
  'method': true,
  'min': true,
  'multiple': true,
  'muted': true,
  'name': true,
  'pattern': true,
  'placeholder': true,
  'poster': true,
  'preload': true,
  'radiogroup': true,
  'rel': true,
  'required': true,
  'sandbox': true,
  'scope': true,
  'scrolling': true,
  'selected': true,
  'span': true,
  'spellcheck': true,
  'src': true,
  'srcdoc': true,
  'srcset': true,
  'start': true,
  'step': true,
  'style': true,
  'target': true,
  'title': true,
  'type': true,
  'value': true
};

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
  'cellspacing': 'cellSpacing',
  'cellpadding': 'cellPadding',
  'colspan': 'colSpan',
  'contenteditable': 'contentEditable',
  'contextmenu': 'contextMenu',
  'crossorigin': 'crossOrigin',
  'formnovalidate': 'formNoValidate',
  'frameborder': 'frameBorder',
  'maxlength': 'maxLength',
  'mediagroup': 'mediaGroup',
  'novalidate': 'noValidate',
  'scrollleft': 'scrollLeft',
  'scrolltop': 'scrollTop',
  'readonly': 'readOnly',
  'rowspan': 'rowSpan',
  'tabindex': 'tabIndex',
  'usemap': 'useMap'
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
  if (nonTransformedProperties[attributeName] !== true) {
    return false;
  }
  return attributeName;
}

module.exports = function processProperties(properties, options) {
  var opts = options || {};
  // Attribute only mode is only used for the toString method, so no processing is needed
  if (opts.attributesOnly) {
    return {
      attributes: properties
    };
  }

  // Elements with namespaces are finicky, usually SVG
  // Treat all properties as attributes
  if (properties.namespace) {
    var ns = properties.namespace;
    properties.namespace = undefined;
    return {
      namespace: ns,
      attributes: properties
    };
  }

  var propertyNames = _.keys(properties);
  var result = {};

  for (var i = 0; i < propertyNames.length; i++) {
    var propName = propertyNames[i];
    var propValue = properties[propName];
    var lowerPropName = propName.toLowerCase();
    var transformedName = transformPropertyName(lowerPropName);

    if (opts.useHooks && typeof opts.useHooks[lowerPropName] === 'function') {
      propValue = opts.useHooks[lowerPropName](propValue);
    }

    if (transformedName === false) {
      if (!result.attributes) {
        result.attributes = {};
      }
      result.attributes[propName] = propValue;
    } else if (lowerPropName === 'style') {
      var rules = {};
      if (typeof propValue === 'string') {
        // Handle parsing style tags into CSS rules
        // @TODO: expand parsing to avoid "changing" all rules whenever any rule changes
        rules = {
          cssText: propValue
        };
      } else {
        rules = propValue;
      }
      result.style = rules;
    } else {
      result[transformedName] = propValue;
    }
  }

  return result;
};
