'use strict';

var ToVdom = require('./to_vdom');

function ToString() {
  ToVdom.apply(this, arguments);
}
ToString.prototype = new ToVdom();
ToString.prototype.constructor = ToString;

ToString.prototype.openElement = function() {
  throw 'An attribute cannot contain an element';
};

ToString.prototype.createObject = function(obj) {
  this.closeElem(obj);
};

ToString.prototype.createComment = function() {
  throw 'An attribute cannot contain a comment';
};

ToString.prototype.closeElement = function() {
  throw 'An attribute cannot contain an element';
};

ToString.prototype.getOutput = function()  {
  return this.result.join('');
};

ToString.prototype.clear = function()  {
  this.result = [];
  this.stack = [];
};

module.exports = ToString;