'use strict';

/**
 * Creates an HTML string from a VTree
 * This bypasses any DOM restrictions to give an accurate view of the VTree
 */

var _ = require('underscore');
var logger = require('../utils/logger');

var virtualDomImplementation = require('../vdom/virtual_dom_implementation');
var virtualHyperscript = require('../vdom/virtual_hyperscript');
var vdom = virtualDomImplementation.vdom;
var utils = require('./to_string_utils');

function toString(vtree, escaped) {
  var chars = utils.entities[escaped ? 'escaped' : 'unescaped'];
  var output = '';
  var i;
  if (virtualDomImplementation.isVNode(vtree)) {
    var tagName = vtree.tagName.toLowerCase();
    output += chars.open + tagName;
    var addAttributes = function(val, key) {
      if (virtualDomImplementation.isHook(val)) {
        return;
      }
      if (key === 'attributes') {
        return;
      }
      if (key.toLowerCase() === 'contenteditable' && val.toLowerCase() === 'inherit') {
        return;
      }
      if (utils.propertiesToTransform[key]) {
        output += ' ' + utils.propertiesToTransform[key] + '=' + chars.quote + val + chars.quote;
      } else {
        output += ' ' + key + '=' + chars.quote + val + chars.quote;
      }
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
      output += vtree.templateToString(escaped);
    } else {
      logger.warn('Widget type: ' + vtree.constructor.name + ' has no templateToString function, falling back to DOM');
      var elem = vdom.create(virtualHyperscript('div', {}, vtree));
      output += elem.innerHTML;
    }
  } else if (virtualDomImplementation.isVText(vtree)) {
    output += utils.escapeString(vtree.text);
  } else if (typeof vtree === 'string') {
    output += utils.escapeString(vtree);
  } else if (vtree.length) {
    for (i = 0; i < vtree.length; i++) {
      output += toString(vtree[i], escaped);
    }
  }
  return output;
}

module.exports = toString;
