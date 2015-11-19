'use strict';

var tungsten = require('../../tungsten');
var HTMLCommentWidget = require('../widgets/html_comment');
var htmlParser = require('../html_parser');
var DefaultStack = require('./default');
var Autofocus = require('../hooks/autofocus');

function VdomStack(attributesOnly, debugMode) {
  DefaultStack.call(this, attributesOnly, debugMode);
  // Override default property
  this.propertyOpts.useHooks = {
    'autofocus': Autofocus
  };
}
VdomStack.prototype = new DefaultStack();
VdomStack.prototype.constructor = VdomStack;

VdomStack.prototype.processObject = function(obj) {
  if (obj.type === 'node') {
    // virtual-dom has issues removing the contentEditable property, so leaving a default in place is needed
    if (!obj.properties.contentEditable) {
      obj.properties.contentEditable = 'inherit';
    }
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
