/**
 * Tungsten.js
 * Copyright 2015 Wayfair, LLC
 * Available under the Apache Version 2.0 License
 *
 * https://github.com/wayfair/tungstenjs
 *
 * @author Matt DeGennaro <mdegennaro@wayfair.com>
 * @license Apache-2.0
 */
'use strict';
var _ = require('underscore');
var globalEvents = require('./event/global_events');
var virtualDomImplementation = require('./vdom/virtual_dom_implementation');
var virtualHyperscript = require('./vdom/virtual_hyperscript');

var vdom = virtualDomImplementation.vdom;
var domToVdom = virtualDomImplementation.domToVdom;
var exports = {};

exports.bindEvent = function(el, eventName, selector, method) {
  globalEvents.validateSelector(selector);
  return globalEvents.bindVirtualEvent(el, eventName, selector, method);
};

exports.unbindEvents = function(events) {
  if (events && events.length) {
    var evt;
    for (var i = 0; i < events.length; i++) {
      evt = events[i];
      globalEvents.unbindVirtualEvent(evt[0], evt[1], evt[2], evt[3]);
    }
  }
};

function updateTree(container, initialTree, newTree) {
  var patch = vdom.diff(initialTree, newTree);
  vdom.patch(container, patch);
  return newTree;
}

function updateContainer(container, initialTree, updatedMarkup) {
  var clonedContainer = container.cloneNode();
  clonedContainer.innerHTML = updatedMarkup;
  var newTree = domToVdom(clonedContainer);
  var patch = vdom.diff(initialTree, newTree);
  if (_.size(patch) > 0) {
    vdom.patch(container, patch);
  }
  return newTree;
}

// Methods to parse DOM or String to vtree
exports.parseDOM = domToVdom;
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
exports.updateContainer = updateContainer;

module.exports = exports;
