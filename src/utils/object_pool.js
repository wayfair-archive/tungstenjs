/**
 * Abstract structure to pool and recycle constructed objects
 */
'use strict';

function ObjectPool(limit, constructorFunc) {
  this.allocatedObjects = new Array(limit);
  this.constructorFunc = constructorFunc;
  this.limit = limit;
  this.size = 0;
  this.key = constructorFunc.name;

  var self = this;
  constructorFunc.prototype.recycle = function() {
    self.recycle(this);
  };
}

/**
 * Allocates and recycles a number of objects for later use
 * Can be run during periods of low-execution to save cycles later
 * @param  {Number} num  Number of objects to allocate into the pool
 */
ObjectPool.prototype.preallocate = function(num) {
  var objs = new Array(num);
  for (var i = num; i--;) {
    objs[i] = this.allocate();
  }
  for (i = num; i--;) {
    objs[i].recycle();
  }
};

/**
 * Creates a new or uses a recycled object and constructs it
 * Arguments passed into allocate will be passed through to the constructor
 * @return {Any} Allocated object
 */
ObjectPool.prototype.allocate = function() {
  var temp;
  if (this.size > 0) {
    // Reduce the available pool size
    this.size--;
    // Grab the object at the pointer and null it from the array
    temp = this.allocatedObjects[this.size];
    this.allocatedObjects[this.size] = null;
  } else {
    // If we don't have any preallocated ones available, make a new one
    temp = new this.constructorFunc();
  }

  this.constructorFunc.apply(temp, arguments);
  return temp;
};

/**
 * Puts the object back into the pool if there is room
 * If there isn't room, it's left loose to be dealloc-ed
 * @param  {Any} recyclable  Object to recycle
 */
ObjectPool.prototype.recycle = function(recyclable) {
  if (this.size < this.limit) {
    if (typeof recyclable.recycleObj === 'function') {
      recyclable.recycleObj();
    }
    this.allocatedObjects[this.size] = recyclable;
    this.size++;
  }
};

module.exports = ObjectPool;