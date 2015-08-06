'use strict';

var _ = require('underscore');
var ToVdom = require('./to_vdom');

function ToHtmlString() {
  ToVdom.apply(this, arguments);
  this.attributesOnly = true;
}
ToHtmlString.prototype = new ToVdom();
ToHtmlString.prototype.constructor = ToHtmlString;

var noClosing = {
  'br': true,
  'hr': true,
  'img': true,
  'input': true,
  'meta': true,
  'link': true
};
var selfClosing = {
  'area': true,
  'base': true,
  'col': true,
  'command': true,
  'embed': true,
  'hr': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
};

var charsToEscape = /[&<>\"\']/;
var escapeCharacters = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/\"/g, '&quot;']
];
// "

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
ToHtmlString.prototype.closeElem = function(obj) {
  // if this is an element, create a VNode now so that count is set properly
  if (obj.type === 'tempNode') {
    var htmlStr = '<' + obj.tagName;
    _.each(obj.properties.attributes, function(value, name) {
      htmlStr += ' ' + name + '="' + value + '"';
    });
    if (obj.children.length) {
      htmlStr += '>';
      htmlStr += obj.children.join('');
      htmlStr += '</' + obj.tagName + '>';
    } else if (selfClosing[obj.tagName]) {
      htmlStr += '/>';
    } else if (noClosing[obj.tagName]) {
      htmlStr += '>';
    } else {
      htmlStr += '></' + obj.tagName + '>';
    }
    obj = htmlStr;
  }

  var pushingTo;
  if (this.stack.length > 0) {
    pushingTo = this.stack[this.stack.length - 1].children;
  } else {
    pushingTo = this.result;
  }

  pushingTo.push(obj);
};

ToHtmlString.prototype.createObject = function(obj, options) {
  if (typeof obj === 'string' && options && options.escape) {
    this.closeElem(escapeString(obj));
  } else {
    this.closeElem(obj);
  }
};

ToHtmlString.prototype.createComment = function(text) {
  this.closeElem('<!-- ' + text + ' -->');
};

ToHtmlString.prototype.getOutput = function()  {
  return this.result.join('');
};

ToHtmlString.prototype.clear = function()  {
  this.result = [];
  this.stack = [];
};

module.exports = ToHtmlString;