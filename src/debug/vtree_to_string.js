'use strict';

/**
 * Creates an HTML string from a VTree
 * This bypasses any DOM restrictions to give an accurate view of the VTree
 */

var _ = require('underscore');

var virtualDomImplementation = require('../vdom/virtual_dom_implementation');
var virtualHyperscript = require('../vdom/virtual_hyperscript');
var vdom = virtualDomImplementation.vdom;
var entityMap = {};
_.each(require('html-tokenizer/entity-map'), function(charCode, name) {
  // Ignore whitespace only characters
  if (!/\s/.test(charCode)) {
    entityMap[charCode.charCodeAt(0)] = '&amp;' + name.toLowerCase() + ';';
  }
});

function escapeString(str) {
  var output = '';
  for (var i = 0; i < str.length; i++) {
    output += entityMap[str.charCodeAt(i)] || str.charAt(i);
  }
  return output;
}

/**
 * Transformed property names that should reverted
 * @type {Object}
 */
var propertiesToTransform = {
  'className': 'class',
  'htmlFor': 'for',
  'httpEquiv': 'http-equiv'
};

var entities = {
  unescaped: {
    amp: '&',
    open: '<',
    close: '>',
    quote: '"'
  },
  escaped: {
    amp: '&amp;',
    open: '&lt;',
    close: '&gt;',
    quote: '&quot;'
  }
};

var noClosing = _.invert(['br', 'hr', 'img', 'input', 'meta', 'link']);
var selfClosing = _.invert(['area', 'base', 'col', 'command', 'embed', 'hr', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
function toString(vtree, escaped) {
  var chars = entities[escaped ? 'escaped' : 'unescaped'];
  var output = '';
  var i;
  if (virtualDomImplementation.isVNode(vtree)) {
    var tagName = vtree.tagName.toLowerCase();
    output += chars.open + tagName;
    var addAttributes = function(val, key) {
      var attrVal = val;
      if (virtualDomImplementation.isHook(val)) {
        attrVal = val.value;
        return;
      }
      if (key === 'attributes') {
        return;
      }
      if (key.toLowerCase() === 'contenteditable' && val.toLowerCase() === 'inherit') {
        return;
      }
      if (propertiesToTransform[key]) {
        output += ' ' + propertiesToTransform[key] + '=' + chars.quote + val + chars.quote;
      } else {
        output += ' ' + key + '=' + chars.quote + val + chars.quote;
      }
    };
    _.each(vtree.properties, addAttributes);
    _.each(vtree.properties.attributes, addAttributes);
    if (noClosing[tagName] != null) {
      output += chars.close;
    } else if (selfClosing[tagName] != null) {
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
      output += vtree.templateToString(true);
    } else {
      console.warn('Widget type: ' + vtree.constructor.name + ' has no templateToString function, falling back to DOM');
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