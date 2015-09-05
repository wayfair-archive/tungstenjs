'use strict';

var FocusHook = require('../../../../src/template/hooks/focus_hook.js');

describe('focus_hook.js', function() {
  it('should be a function', function() {
    expect(FocusHook).to.be.a('function');
    expect(FocusHook).to.have.length(0);
  });
  describe('constructor', function() {
    it('constructs with new', function() {
      var hook = new FocusHook();
      expect(hook).to.be.instanceof(FocusHook);
    });
    it('constructs without new', function() {
      var hook = FocusHook();
      expect(hook).to.be.instanceof(FocusHook);
    });
  });
  describe('hook', function() {
    it('should be a function', function() {
      expect(FocusHook.prototype.hook).to.be.a('function');
      expect(FocusHook.prototype.hook).to.have.length(3);
    });
    it('should focus an element', function(done) {
      var elem = {
        focus: jasmine.createSpy()
      };
      var hook = FocusHook();
      hook.hook(elem, null, null);
      setTimeout(function() {
        jasmineExpect(elem.focus).toHaveBeenCalled();
        done();
      }, 10);
    });
    it('should not focus an element if it was previously set', function(done) {
      var elem = {
        focus: jasmine.createSpy()
      };
      var hook = FocusHook();
      hook.hook(elem, null, true);
      setTimeout(function() {
        jasmineExpect(elem.focus).not.toHaveBeenCalled();
        done();
      }, 10);
    });
    it('should not focus an element if it is currently set', function(done) {
      var elem = {
        focus: jasmine.createSpy()
      };
      var hook = FocusHook();
      document.activeElement = elem;
      hook.hook(elem, null, null);
      setTimeout(function() {
        jasmineExpect(elem.focus).not.toHaveBeenCalled();
        done();
      }, 10);
    });
  });
});