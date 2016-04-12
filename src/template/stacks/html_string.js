'use strict';

var _ = require('underscore');
var DefaultStack = require('./default');
var virtualDomImplementation = require('../../vdom/virtual_dom_implementation');
var isWidget = virtualDomImplementation.isWidget;
var htmlHelpers = require('../html_helpers');
var escapeString = require('../../utils/escape_string');

function HtmlStringStack(asHTML) {
  this.htmlMode = !!asHTML;
  DefaultStack.call(this, true);
}
HtmlStringStack.prototype = new DefaultStack();
HtmlStringStack.prototype.constructor = HtmlStringStack;



/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
HtmlStringStack.prototype.processObject = function(obj) {
  if (obj.type === 'node') {
    var htmlStr = '<' + obj.tagName;
    // For HTML strings, a textarea's value is defined by it's childNode
    // For everything else, it uses the value property
    // Since .toString is used least by far, add the expense here
    if (obj.tagName.toLowerCase() === 'textarea' && obj.properties.attributes && obj.properties.attributes.value != null) {
      obj.children = [obj.properties.attributes.value];
      obj.properties.attributes.value = null;
    }
    _.each(obj.properties.attributes, function(value, name) {
      if (typeof value === 'boolean') {
        htmlStr += ' ' + name;
      } else if (value != null) {
        if (typeof value === 'string') {
          // Virtual-dom or the DOM normally handles escaping attribute values
          // but that doesn't come into play here, so we need to escape ourselves
          value = escapeString(value);
        }
        htmlStr += ' ' + name + '="' + value + '"';
      }
    });

    if (obj.children.length) {
      htmlStr += '>';
      htmlStr += obj.children.join('');
      htmlStr += '</' + obj.tagName + '>';
    } else if (htmlHelpers.tags.selfClosing[obj.tagName]) {
      htmlStr += '/>';
    } else if (htmlHelpers.tags.noClosing[obj.tagName]) {
      htmlStr += '>';
    } else {
      htmlStr += '></' + obj.tagName + '>';
    }
    return htmlStr;
  } else if (obj.type === 'comment') {
    return '<!--' + obj.text + '-->';
  }

  return obj;
};

HtmlStringStack.prototype.createObject = function(obj, options) {
  if (isWidget(obj)) {
    obj.template._iterate(null, obj.model, null, null, this);
  } else if (typeof obj === 'string' && options && options.escape) {
    this._closeElem(escapeString(obj));
  } else if (this.htmlMode && typeof obj === 'string' && options && options.escapeHTML) {
    this._closeElem(escapeString(obj));
  } else {
    this._closeElem(obj);
  }
};

HtmlStringStack.prototype.processArrayOutput = function(output) {
  return output.join('');
};

module.exports = HtmlStringStack;
