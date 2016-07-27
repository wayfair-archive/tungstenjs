/**
 * Tungsten.js
 * Copyright 2016 Wayfair, LLC
 * Available under the Apache Version 2.0 License
 *
 * https://github.com/wayfair/tungstenjs
 *
 * @author Matt DeGennaro <mdegennaro@wayfair.com>
 * @license Apache-2.0
 */
/* global TUNGSTENJS_VERSION */
'use strict';
var document = require('global/document');
var window = require('global/window');
var globalEvents = require('lazy_initializer!./event/global_events');
var virtualDOM = require('lazy_initializer!./vdom/virtual_dom_implementation');
var virtualHyperscript = require('lazy_initializer!./vdom/virtual_hyperscript');
var htmlParser = require('lazy_initializer!./template/html_parser');

var exports = {};

exports.VERSION = typeof TUNGSTENJS_VERSION !== 'undefined' ? TUNGSTENJS_VERSION : null;

exports.IS_DEV = false;

exports.addEventPlugin = function(handler) {
  return globalEvents().addEventPlugin(handler);
};
exports.unbindEvent = function(evt) {
  return globalEvents().unbindVirtualEvent(evt);
};

exports.bindEvent = function(el, eventName, selector, method, options) {
  globalEvents().validateSelector(selector);
  if (selector === '') {
    selector = 'self';
  } else {
    selector = selector.substr(1);
  }
  return globalEvents().bindVirtualEvent(el, eventName, selector, method, options);
};


function updateTree(container, initialTree, newTree) {
  var vdom = virtualDOM().vdom;
  var patch = vdom.diff(initialTree, newTree);
  var elem = vdom.patch(container, patch);
  // Repool VDom used in initial tree
  initialTree.recycle();
  return {
    vtree: newTree,
    elem: elem
  };
}

if (TUNGSTENJS_DEBUG_MODE) {
  exports.debug = require('./debug');
  if (window.Element) {
    // Override toJSON for DOM nodes to prevent circular references in debug mode
    window.Element.prototype.toJSON = function() {
      return null;
    };
  }
}

function parseString(htmlString) {
  var VdomStack = require('./template/stacks/vdom');
  var stack = new VdomStack();
  htmlParser()(htmlString, stack);
  return stack.getOutput();
}

function parseDOM(elem) {
  return parseString(elem.outerHTML);
}
exports.parseString = parseString;
exports.parseDOM = parseDOM;

// Methods to output the vtree as a browser-usable format
// returns document fragment
exports.toDOM = function(vtree) {
  var vdom = virtualDOM().vdom;
  var wrapper = virtualHyperscript()('div', {}, vtree);
  var elem = vdom.create(wrapper);
  var result = document.createDocumentFragment();
  while (elem.childNodes.length) {
    result.appendChild(elem.childNodes[0]);
  }
  return result;
};
exports.toString = function(vtree) {
  var vdom = virtualDOM().vdom;
  var wrapper = virtualHyperscript()('div', {}, vtree);
  var elem = vdom.create(wrapper);
  return elem.innerHTML;
};
// Create VNode from input (to obfuscate specific format)
exports.createVNode = function(tagName, properties, children) {
  return virtualHyperscript()(tagName, properties, children);
};
// Update the container with vtree
exports.updateTree = updateTree;

module.exports = exports;
