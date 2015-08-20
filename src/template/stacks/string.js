'use strict';

var DefaultStack = require('./default');

function StringStack(attributesOnly, debugMode) {
  DefaultStack.call(this, attributesOnly, debugMode);
}
StringStack.prototype = new DefaultStack();
StringStack.prototype.constructor = StringStack;

StringStack.prototype.openElement = function() {
  throw 'An attribute cannot contain an element';
};

StringStack.prototype.createComment = function() {
  throw 'An attribute cannot contain a comment';
};

StringStack.prototype.closeElement = function() {
  throw 'An attribute cannot contain an element';
};

StringStack.prototype.getOutput = function() {
  return this.result.join('');
};

module.exports = StringStack;