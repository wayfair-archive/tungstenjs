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

function isChildNode(elem, childNodes) {
  for (var i = 0; i < childNodes.length; i++) {
    if (elem === childNodes[i].el) {
      return childNodes[i];
    }
  }
  return false;
}

var noClosing = _.invert(['br', 'hr', 'img', 'input', 'meta', 'link']);
var selfClosing = _.invert(['area', 'base', 'col', 'command', 'embed', 'hr', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function elemToString(tree, escaped, recursive, childNodes) {
  var chars = entities[escaped ? 'escaped' : 'unescaped'];
  var output = '';
  if (!tree) {
    return output;
  }
  var i;
  var childNode = isChildNode(tree, childNodes);
  if (childNode) {
    output += childNode.getDebugTag();
  } else if (tree.tagName) {
    var tagName = tree.tagName.toLowerCase();
    output += chars.open + tagName;
    var addAttributes = function(attr) {
      output += ' ' + attr.name + '=' + chars.quote + attr.value + chars.quote;
    };
    _.each(tree.attributes, addAttributes);
    if (noClosing[tagName] != null) {
      output += chars.close;
    } else if (selfClosing[tagName] != null) {
      output += '' + chars.close;
    } else {
      output += chars.close;
      for (i = 0; i < tree.childNodes.length; i++) {
        output += elemToString(tree.childNodes[i], escaped, recursive, childNodes);
      }
      output += chars.open + '/' + tagName + chars.close;
    }
  } else if (tree.nodeType === 8) {
    output += chars.open + '!-- ' + tree.textContent + ' --' + chars.close;
  } else if (tree.nodeType === 3) {
    output += escapeString(tree.textContent);
  } else if (tree.length) {
    for (i = 0; i < tree.length; i++) {
      output += elemToString(tree[i], escaped, recursive, childNodes);
    }
  }
  return output;
}

function findTopAncestor(node) {
  var ancestor = node;
  while (ancestor.parentNode) {
    ancestor = ancestor.parentNode;
  }
  return ancestor;
}

function isInDOMTree(node) {
  var topAncestor = findTopAncestor(node);
  return topAncestor === document;
}

function toString(view, escaped, recursive, bypassDomCheck) {
  var elemToRender = view.el;
  if (!view.parentView) {
    elemToRender = elemToRender.childNodes;
  }
  if (!bypassDomCheck && !isInDOMTree(view.el)) {
    return 'View is detached from the page DOM';
  } else {
    return elemToString(elemToRender, escaped, recursive, view.getChildViews());
  }
}

module.exports = toString;