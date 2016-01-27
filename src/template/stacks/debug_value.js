'use strict';

var _ = require('underscore');
var DefaultStack = require('./default');

function DebugValueStack() {
  DefaultStack.call(this);
}
DebugValueStack.prototype = new DefaultStack();
DebugValueStack.prototype.constructor = DebugValueStack;

DebugValueStack.prototype.stringify = _.identity;

DebugValueStack.prototype.createObject = function(obj) {
  this._closeElem(obj);
};
DebugValueStack.prototype.processArrayOutput = function(outputArr) {
  if (outputArr.length === 0) {
    return null;
  } else {
    return outputArr;
  }
};

module.exports = DebugValueStack;
