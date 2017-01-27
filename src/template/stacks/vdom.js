'use strict';

var tungsten = require('../../tungsten');
var HTMLCommentWidget = require('../widgets/html_comment');
var htmlParser = require('../html_parser');
var DefaultStack = require('./default');
var Autofocus = require('../hooks/autofocus');
var InputType = require('../hooks/input_type');
var featureDetect = require('../../utils/feature_detect');
var processSvgNamespaces = require('../process_svg_namespaces');

function VdomStack(attributesOnly, debugMode) {
  DefaultStack.call(this, attributesOnly, debugMode);
  // Override default property
  this.propertyOpts.useHooks = {
    autofocus: Autofocus
  };

  // if browser is IE - add [type] attribute hook for Input elements
  if (featureDetect.isIE()) {
    this.propertyOpts.useHooks.type = InputType;
  }
}
VdomStack.prototype = new DefaultStack();
VdomStack.prototype.constructor = VdomStack;

VdomStack.prototype.processObject = function(obj) {
  if (obj.type === 'node') {
    // children of noscript elements should not be processed
    if (obj.tagName === 'noscript') {
      return tungsten.createVNode(obj.tagName, obj.properties, []);
    }
    // virtual-dom has issues removing the contentEditable property, so leaving a default in place is needed
    if (!obj.properties.contentEditable) {
      obj.properties.contentEditable = 'inherit';
    }

    // if we're rendering an element with a namespace, check if any attributes require namespacing
    if (obj.properties.namespace) {
      obj.properties = processSvgNamespaces(obj.properties);
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
