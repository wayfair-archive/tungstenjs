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
var globalEvents = require('./event/global_events');
var virtualDomImplementation = require('./vdom/virtual_dom_implementation');
var virtualHyperscript = require('./vdom/virtual_hyperscript');
var htmlParser = require('./template/html_parser');

var vdom = virtualDomImplementation.vdom;
var exports = {};

exports.VERSION = typeof TUNGSTENJS_VERSION !== 'undefined' ? TUNGSTENJS_VERSION : null;

exports.IS_DEV = false;

exports.addEventPlugin = globalEvents.addEventPlugin;

exports.bindEvent = function(el, eventName, selector, method, options) {
  globalEvents.validateSelector(selector);
  if (selector === '') {
    selector = 'self';
  } else {
    selector = selector.substr(1);
  }
  return globalEvents.bindVirtualEvent(el, eventName, selector, method, options);
};

exports.unbindEvent = globalEvents.unbindVirtualEvent;

function updateTree(container, initialTree, newTree) {
  var patch = vdom.diff(initialTree, newTree);
  var elem = vdom.patch(container, patch);
  // Repool VDom used in initial tree
  initialTree.recycle();
  return {
    vtree: newTree,
    elem: elem
  };
}

/* develblock:start */
exports.debug = require('./debug');
// Override toJSON for DOM nodes to prevent circular references in debug mode
Element.prototype.toJSON = function() {return null;};
/* develblock:end */

exports.parseString = function (htmlString) {
  var VdomStack = require('./template/stacks/vdom');
  var stack = new VdomStack();
  htmlParser(htmlString, stack);
  return stack.getOutput();
};
exports.parseDOM = function(elem) {
  return exports.parseString(elem.outerHTML);
};
// Methods to output the vtree as a browser-usable format
// returns document fragment
exports.toDOM = function(vtree) {
  var wrapper = virtualHyperscript('div', {}, vtree);
  var elem = vdom.create(wrapper);
  var result = document.createDocumentFragment();
  while (elem.childNodes.length) {
    result.appendChild(elem.childNodes[0]);
  }
  return result;
};
exports.toString = function(vtree) {
  var wrapper = virtualHyperscript('div', {}, vtree);
  var elem = vdom.create(wrapper);
  return elem.innerHTML;
};
// Create VNode from input (to obfuscate specific format)
exports.createVNode = virtualHyperscript;
// Update the container with vtree
exports.updateTree = updateTree;

module.exports = exports;
