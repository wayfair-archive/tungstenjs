'use strict';

/**
 * Creates an HTML string from a VTree
 * This bypasses any DOM restrictions to give an accurate view of the VTree
 */

var _ = require('underscore');
var errors = require('../utils/errors');
var syntaxHighlight = require('./syntax_highlight');

var virtualDomImplementation = require('../vdom/virtual_dom_implementation');
var virtualHyperscript = require('../vdom/virtual_hyperscript');
var vdom = virtualDomImplementation.vdom;
var utils = require('./to_string_utils');
var escapeString = require('../utils/escape_string');

function toString(vtree, escaped) {
  var chars = utils.entities[escaped ? 'escaped' : 'unescaped'];
  var output = '';
  var i;
  if (virtualDomImplementation.isVNode(vtree)) {
    var tagName = syntaxHighlight.tag(vtree.tagName.toLowerCase());
    output += chars.open + tagName;
    var addAttributes = function(val, key) {
      if (virtualDomImplementation.isHook(val)) {
        return;
      }
      if (key === 'attributes' || key === 'namespace') {
        return;
      }
      if (key.toLowerCase() === 'style') {
        val = val.cssText;
      }
      if (key.toLowerCase() === 'contenteditable' && val.toLowerCase() === 'inherit') {
        return;
      }
      output += ' ' + syntaxHighlight.attribute(utils.propertiesToTransform[key] || key, val);
    };
    _.each(vtree.properties, addAttributes);
    _.each(vtree.properties.attributes, addAttributes);
    if (utils.noClosing[tagName] != null) {
      output += chars.close;
    } else if (utils.selfClosing[tagName] != null) {
      output += '' + chars.close;
    } else {
      output += chars.close;
      for (i = 0; i < vtree.children.length; i++) {
        output += toString(vtree.children[i], escaped);
      }
      output += chars.open + '/' + tagName + chars.close;
    }
  } else if (virtualDomImplementation.isWidget(vtree)) {
    if (typeof vtree.templateToString === 'function') {
      output += vtree.templateToString(toString);
    } else {
      errors.widgetTypeHasNoTemplateToStringFunctionFallingBackToDOM(vtree.constructor.name);
      var elem = vdom.create(virtualHyperscript('div', {}, vtree));
      output += elem.innerHTML;
    }
  } else if (virtualDomImplementation.isVText(vtree)) {
    output += escapeString(vtree.text);
  } else if (typeof vtree === 'string') {
    output += escapeString(vtree);
  } else if (vtree.length) {
    for (i = 0; i < vtree.length; i++) {
      output += toString(vtree[i], escaped);
    }
  }
  return output;
}

module.exports = toString;
