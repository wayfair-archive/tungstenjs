'use strict';

var _ = require('underscore');
var DefaultStack = require('./default');
var virtualDomImplementation = require('../../vdom/virtual_dom_implementation');
var isWidget = virtualDomImplementation.isWidget;
var htmlHelpers = require('../html_helpers');

function HtmlStringStack(attributesOnly, debugMode) {
  DefaultStack.call(this, true, debugMode);
}
HtmlStringStack.prototype = new DefaultStack();
HtmlStringStack.prototype.constructor = HtmlStringStack;

var charsToEscape = /[&<>\"\']/;
var escapeCharacters = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/\"/g, '&quot;']
];
// closing syntax highlighting from quote "

function escapeString(str) {
  if (charsToEscape.test(str)) {
    for (var i = 0; i < escapeCharacters.length; i++) {
      str = str.replace(escapeCharacters[i][0], escapeCharacters[i][1]);
    }
  }
  return str;
}

/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
HtmlStringStack.prototype.processObject = function(obj) {
  // if this is an element, create a VNode now so that count is set properly
  if (obj.type === 'node') {
    var htmlStr = '<' + obj.tagName;
    _.each(obj.properties.attributes, function(value, name) {
      htmlStr += ' ' + name + '="' + value + '"';
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
    obj.template._render(null, obj.model, null, null, this);
  } else if (typeof obj === 'string' && options && options.escape) {
    this._closeElem(escapeString(obj));
  } else {
    this._closeElem(obj);
  }
};

HtmlStringStack.prototype.getOutput = function() {
  DefaultStack.prototype.getOutput.call(this);
  return this.result.join('');
};

module.exports = HtmlStringStack;