'use strict';

var document = require('global/document');
var _ = require('underscore');
var DefaultStack = require('./default');
var virtualDomImplementation = require('../../vdom/virtual_dom_implementation');
var isWidget = virtualDomImplementation.isWidget;
var htmlParser = require('../html_parser');

function applyProperties(node, props) {
  for (var propName in props) {
    var propValue = props[propName];
    if (propName === 'attributes') {
      for (var attrName in propValue) {
        var attrValue = propValue[attrName];

        if (attrValue !== undefined) {
          node.setAttribute(attrName, attrValue);
        }
      }
    } else if (_.isObject(propValue)) {
      applyProperties(node[propName], propValue);
    } else {
      node[propName] = propValue;
    }
  }
}

function DomStack(attributesOnly, debugMode) {
  DefaultStack.call(this, attributesOnly, debugMode);
}
DomStack.prototype = new DefaultStack();
DomStack.prototype.constructor = DomStack;

DomStack.prototype.processObject = function(obj) {
  var i, l, c;
  if (_.isArray(obj)) {
    var frag = document.createDocumentFragment();
    for (i = 0, l = obj.length; i < l; i++) {
      c = this.processObject(obj[i]);
      frag.appendChild(c);
    }
    return frag;
  } else if (obj.type === 'node') {
    var node = obj.properties.namespace ?
      document.createElementNS(obj.properties.namespace, obj.tagName) :
      document.createElement(obj.tagName);
    applyProperties(node, obj.properties);
    for (i = 0, l = obj.children.length; i < l; i++) {
      node.appendChild(obj.children[i]);
    }
    return node;
  } else if (obj.type === 'comment') {
    return document.createComment(obj.text);
  } else if (typeof obj === 'string') {
    return document.createTextNode(obj);
  } else {
    return obj;
  }
};

DomStack.prototype.appendItem = function(pushingTo, obj) {
  var lastItem = pushingTo[pushingTo.length - 1];
  var lastItemIsText = lastItem && lastItem.nodeType === 3;
  if (typeof obj === 'string' && typeof lastItem === 'string') {
    // string/string
    pushingTo[pushingTo.length - 1] += obj;
  } else if (typeof obj === 'string' && lastItemIsText) {
    // textNode/string
    pushingTo[pushingTo.length - 1].nodeValue += obj;
  } else if (obj.nodeType === 3 && lastItemIsText) {
    // textNode/textNode
    pushingTo[pushingTo.length - 1].nodeValue += obj.nodeValue;
  } else {
    pushingTo.push(obj);
  }
};

DomStack.prototype.createObject = function(obj, options) {
  if (isWidget(obj)) {
    obj.template._iterate(null, obj.model, null, null, this);
  } else if (typeof obj === 'string' && options && options.parse) {
    // Naive check to avoid parsing if value contains nothing HTML-ish or HTML-entity-ish
    if (obj.indexOf('<') > -1 || obj.indexOf('&') > -1) {
      htmlParser(obj, this);
    } else {
      this._closeElem(obj);
    }
  } else {
    this._closeElem(obj);
  }
};

DomStack.prototype.processArrayOutput = function(output) {
  var domFrag = document.createDocumentFragment();
  for (var i = 0; i < output.length; i++) {
    domFrag.appendChild(output[i]);
  }
  return domFrag;
};

module.exports = DomStack;
