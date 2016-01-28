var renderQueue = require('../../../adaptors/shared/render_queue');

describe('render_queue', function() {
  describe('queue', function() {
    it('should be a function', function() {
      expect(renderQueue.queue).to.be.a('function');
      expect(renderQueue.queue).to.have.length(2);
    });
    it('should queue functions to be called', function(done) {
      var obj = {
        fn: jasmine.createSpy('fn')
      };
      var obj2 = {
        fn: jasmine.createSpy('fn')
      };
      renderQueue.queue(obj, obj.fn);
      renderQueue.queue(obj2, obj2.fn);

      expect(Object.keys(obj)).to.have.length(2);
      expect(Object.keys(obj2)).to.have.length(2);
      expect(obj).to.include.keys(['fn', renderQueue._key]);
      expect(obj2).to.include.keys(['fn', renderQueue._key]);
      setTimeout(function() {
        jasmineExpect(obj.fn).toHaveBeenCalled();
        jasmineExpect(obj2.fn).toHaveBeenCalled();
        expect(obj.fn.calls.count()).to.equal(1);
        expect(obj2.fn.calls.count()).to.equal(1);
        done();
      }, 100);
    });
    it('should not repeat queued functions if queued repeatedly', function(done) {
      var obj = {
        fn: jasmine.createSpy('fn')
      };
      renderQueue.queue(obj, obj.fn);
      renderQueue.queue(obj, obj.fn);
      renderQueue.queue(obj, obj.fn);
      renderQueue.queue(obj, obj.fn);
      renderQueue.queue(obj, obj.fn);

      setTimeout(function() {
        jasmineExpect(obj.fn).toHaveBeenCalled();
        expect(obj.fn.calls.count()).to.equal(1);
        done();
      }, 100);
    });
    it('should not queue if arguments do not match', function(done) {
      var obj = {
        fn: jasmine.createSpy('fn')
      };
      obj[renderQueue._key] = true;
      renderQueue.queue(obj, obj.fn);

      var obj2 = {
        foo: 'bar'
      };
      renderQueue.queue(obj2, obj2.foo);
      expect(Object.keys(obj2)).to.have.length(1);

      setTimeout(function() {
        jasmineExpect(obj.fn).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});
