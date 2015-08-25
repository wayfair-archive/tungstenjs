'use strict';

var _ = require('underscore');
var DefaultStack = require('./default');
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
    }
    if (_.isObject(propValue)) {
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
    var node = document.createElement(obj.tagName);
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

DomStack.prototype.createObject = function(obj, options) {
  if (typeof obj === 'string' && options && options.parse) {
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

module.exports = DomStack;