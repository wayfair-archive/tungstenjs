'use strict';

var tungsten = require('../../tungsten');
var HTMLCommentWidget = require('../widgets/html_comment');
var htmlParser = require('../html_parser');
var DefaultStack = require('./default');

function VdomStack(attributesOnly, debugMode) {
  DefaultStack.call(this, attributesOnly, debugMode);
  // Override default property
  this.propertyOpts.useHooks = true;
}
VdomStack.prototype = new DefaultStack();
VdomStack.prototype.constructor = VdomStack;

VdomStack.prototype.processObject = function(obj) {
  if (obj.type === 'node') {
    return tungsten.createVNode(obj.tagName, obj.properties, obj.children);
  } else if (obj.type === 'comment') {
    return new HTMLCommentWidget(obj.text);
  }

  return obj;
};

VdomStack.prototype.createObject = function(obj, options) {
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

module.exports = VdomStack;