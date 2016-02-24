'use strict';

var ObjectPool = require('../../../src/utils/object_pool.js');
var Recycleable;

describe('object_pool.js public API', function() {
  it('should be a function', function() {
    expect(ObjectPool).to.be.a('function');
    expect(ObjectPool).to.have.length(2);
  });
  describe('constructed API', function() {
    var pool;
    beforeEach(function() {
      Recycleable = function(a, b) {
        this.a = a;
        this.b = b;
      };
      pool = new ObjectPool(5, Recycleable);
    });
    it('should be able to preallocate', function() {
      expect(pool.size).to.equal(0);
      pool.preallocate(2);
      expect(pool.size).to.equal(2);
    });
    it('should be able to allocate', function() {
      expect(pool.size).to.equal(0);
      var obj = pool.allocate();
      expect(pool.size).to.equal(0);
      expect(obj).to.be.instanceof(Recycleable);
    });
    it('should be able to allocate with args', function() {
      expect(pool.size).to.equal(0);
      var a = {};
      var b = {};
      var obj = pool.allocate(a, b);
      expect(pool.size).to.equal(0);
      expect(obj).to.be.instanceof(Recycleable);
      expect(obj.a).to.equal(a);
      expect(obj.b).to.equal(b);
    });
    it('should be able to recycle an object when space allows', function() {
      var obj = pool.allocate();
      obj.recycle();
      expect(pool.size).to.equal(1);
    });
    it('should not overfill allocation limit', function() {
      var obj = pool.allocate();
      pool.preallocate(pool.limit);
      expect(pool.size).to.equal(pool.limit);
      obj.recycle();
      expect(pool.size).to.equal(pool.limit);
    });
    it('can allow an object to handle its own recycling', function() {
      Recycleable.prototype.recycleObj = jasmine.createSpy();
      var obj = pool.allocate();
      obj.recycle();
      jasmineExpect(Recycleable.prototype.recycleObj).toHaveBeenCalled();
    });
  });
});
