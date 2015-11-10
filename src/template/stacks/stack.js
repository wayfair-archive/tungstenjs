'use strict';

var _ = require('underscore');
var ObjectPool = require('../../utils/object_pool');

function Stack(size) {
  if (typeof size !== 'number') {
    size = 100;
  }
  if (!this.arr) {
    this.arr = new Array(size);
  } else if (this.arr.length !== size) {
    this.arr.length = size;
  }
  if (this.length > 0) {
    this.clear();
  }
  this.length = 0;
}

Stack.prototype.at = function(index) {
  return this.length > index ? this.arr[index] : undefined;
};

Stack.prototype.push = function(item) {
  // Combine adjacent strings
  if (this.length > 0 && typeof item === 'string' && typeof this.arr[this.length - 1] === 'string') {
    this.arr[this.length - 1] += item;
  } else {
    this.arr[this.length] = item;
    this.length += 1;
  }
};

Stack.prototype.pop = function() {
  this.length -= 1;
  var item = this.arr[this.length];
  this.arr[this.length] = undefined;
  return item;
};

Stack.prototype.peek = function() {
  return this.arr[this.length - 1];
};

Stack.prototype.map = function(fn) {
  var result = new Array(this.length);
  for (var i = 0, l = this.length; i < l; i++) {
    result[i] = fn(this.arr[i]);
  }
  return result;
};

Stack.prototype.clear = function() {
  for (var i = 0, l = this.length; i < l; i++) {
    this.arr[i] = undefined;
  }
  this.length = 0;
};

Stack.prototype.toArray = function() {
  return this.map(_.identity);
};

Stack.prototype.recycleObj = function() {
  this.clear();
};

var stackPool = new ObjectPool(2000, Stack);
stackPool.preallocate(100);

module.exports = stackPool;
