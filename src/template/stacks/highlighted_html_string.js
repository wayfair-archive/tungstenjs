'use strict';

var _ = require('underscore');
var HtmlStringStack = require('./html_string');
var htmlHelpers = require('../html_helpers');
var syntaxHighlight = require('../../debug/syntax_highlight');

function HighlightedHtmlStringStack() {
  HtmlStringStack.call(this, true);
}
HighlightedHtmlStringStack.prototype = new HtmlStringStack();
HighlightedHtmlStringStack.prototype.constructor = HighlightedHtmlStringStack;

/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
HighlightedHtmlStringStack.prototype.processObject = function(obj) {
  if (obj.type === 'node') {
    var highlightTag = syntaxHighlight.tag(obj.tagName);
    var htmlStr = '&lt;' + highlightTag;
    // For HTML strings, a textarea's value is defined by it's childNode
    // For everything else, it uses the value property
    // Since .toString is used least by far, add the expense here
    if (obj.tagName.toLowerCase() === 'textarea' && obj.properties.attributes && obj.properties.attributes.value != null) {
      obj.children = [obj.properties.attributes.value];
      obj.properties.attributes.value = null;
    }
    _.each(obj.properties.attributes, function(value, name) {
      if (typeof value === 'boolean') {
        htmlStr += ' ' + syntaxHighlight.attrName(name);
      } else if (value != null) {
        htmlStr += ' ' + syntaxHighlight.attribute(name, value);
      }
    });

    if (obj.children.length) {
      htmlStr += '&gt;';
      htmlStr += obj.children.join('');
      htmlStr += '&lt;/' + highlightTag + '&gt;';
    } else if (htmlHelpers.tags.selfClosing[obj.tagName]) {
      htmlStr += '/&gt;';
    } else if (htmlHelpers.tags.noClosing[obj.tagName]) {
      htmlStr += '&gt;';
    } else {
      htmlStr += '&gt;&lt;/' + highlightTag + '&gt;';
    }
    return htmlStr;
  } else if (obj.type === 'comment') {
    return syntaxHighlight.comment(obj.text);
  }

  return obj;
};

HighlightedHtmlStringStack.prototype._createObject = HtmlStringStack.prototype.createObject;
HighlightedHtmlStringStack.prototype.createObject = function(obj, options) {
  if (options && options.mustache && obj.substr(0, 3) !== '{{!') {
    obj = syntaxHighlight.mustache(obj, options.mustache);
  }
  this._createObject(obj, options);
};

module.exports = HighlightedHtmlStringStack;
