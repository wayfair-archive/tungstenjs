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

exports.IS_DEV = false;

exports.addEventPlugin = globalEvents.registerEventHandler;

exports.bindEvent = function(el, eventName, selector, method, options) {
  globalEvents.validateSelector(selector);
  if (selector === '') {
    selector = 'self';
  } else {
    selector = selector.substr(1);
  }
  return globalEvents.bindVirtualEvent(el, eventName, selector, method, options);
};

exports.unbindEvent = function(event) {
  globalEvents.unbindVirtualEvent(event);
};

function updateTree(container, initialTree, newTree) {
  var patch = vdom.diff(initialTree, newTree);
  vdom.patch(container, patch);
  // Repool VDom used in initial tree
  initialTree.recycle();
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

/* develblock:start */
exports.debug = require('./debug');
/* develblock:end */

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

var noClosing = _.invert(['br', 'hr', 'img', 'input', 'meta', 'link']);
var selfClosing = _.invert(['area', 'base', 'col', 'command', 'embed', 'hr', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
exports.toString = function(vtree) {
  var output = '';
  var i;
  if (virtualDomImplementation.isVNode(vtree)) {
    var tagName = vtree.tagName.toLowerCase();
    output += '<' + tagName;
    _.each(vtree.properties.attributes, function(val, key) {
      output += ' ' + key + '="' + val + '"';
    });
    if (noClosing[tagName] != null) {
      output += '>';
    } else if (selfClosing[tagName] != null) {
      output += '/>';
    } else {
      output += '>';
      for (i = 0; i < vtree.children.length; i++) {
        output += exports.toString(vtree.children[i]);
      }
      output += '</' + tagName + '>';
    }
  } else if (virtualDomImplementation.isWidget(vtree)) {
    if (typeof vtree.templateToString === 'function') {
      output += vtree.templateToString();
    } else {
      console.warn('Widget type: ' + vtree.constructor.name + ' has no templateToString function, falling back to DOM');
      var elem = vdom.create(virtualHyperscript('div', {}, vtree));
      output += elem.innerHTML;
    }
  } else if (virtualDomImplementation.isVText(vtree)) {
    output += vtree.text;
  } else if (typeof vtree === 'string') {
    output += vtree;
  } else if (vtree.length) {
    for (i = 0; i < vtree.length; i++) {
      output += exports.toString(vtree[i]);
    }
  }
  return output.toLowerCase();
};
// Create VNode from input (to obfuscate specific format)
exports.createVNode = virtualHyperscript;
// Update the container with vtree
exports.updateTree = updateTree;
exports.updateContainer = updateContainer;

module.exports = exports;
