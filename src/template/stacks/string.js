'use strict';

var DefaultStack = require('./default');
var htmlParser = require('../html_parser');
var escapeString = require('./utils/escape_string');

function StringStack(attributesOnly, asHTML) {
  DefaultStack.call(this, attributesOnly);
  this.asHTML = asHTML;
}
StringStack.prototype = new DefaultStack();
StringStack.prototype.constructor = StringStack;

StringStack.prototype.createObject = function(obj, options) {
  var isString = typeof obj === 'string';
  if (this.asHTML && isString && options && options.escape) {
    this._closeElem(escapeString(obj));
  } else if (!this.asHTML && isString && options && options.parse) {
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

StringStack.prototype.openElement = function() {
  throw 'An attribute cannot contain an element';
};

StringStack.prototype.createComment = function() {
  throw 'An attribute cannot contain a comment';
};

StringStack.prototype.closeElement = function() {
  throw 'An attribute cannot contain an element';
};

StringStack.prototype.processArrayOutput = function(output) {
  return output.join('');
};

module.exports = StringStack;
