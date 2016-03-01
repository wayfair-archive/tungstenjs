'use strict';
var mouseenterleaveBind = require('../../../plugins/tungsten-event-mouseenter');
describe('mouseenter_and_mouseleave_events', function() {
  var elem, otherElem, handler, obj;
  beforeEach(function() {
    obj = {};
    elem = document.createElement('div');
    otherElem = document.createElement('div');
    handler = function() {};
  });
  afterEach(function() {
    elem = undefined, otherElem = undefined, handler = undefined, obj = undefined;
  });
  describe('mouseenter_events', function() {
    it('should call bindVirtualEvent with mouseenter event', function() {
      obj.bindEventFn = function(el, eventName, selector, method) {
        method({
          currentTarget: elem,
          target: elem,
          originalEvent: {
            relatedTarget: otherElem
          }
        });
      };
      spyOn(obj, 'bindEventFn').and.callThrough();
      mouseenterleaveBind(elem, 'mouseenter', '.js-foo', handler, {}, obj.bindEventFn);
      jasmineExpect(obj.bindEventFn).toHaveBeenCalledWith(elem, 'mouseover', '.js-foo', jasmine.any(Function), {});
    });
    it('should not call bindVirtualEvent when event is not mouseenter event', function() {
      var spy = jasmine.createSpy('spy');
      mouseenterleaveBind(elem, 'notmouseenter', '.js-foo', handler, {}, spy);
      jasmineExpect(spy).not.toHaveBeenCalled();
    });

  });

  describe('mouseleave_events', function() {
    it('should call bindVirtualEvent with mouseleave event', function() {
      obj.bindEventFn = function(el, eventName, selector, method) {
        method({
          currentTarget: elem,
          target: elem,
          originalEvent: {
            relatedTarget: otherElem
          }
        });
      };
      spyOn(obj, 'bindEventFn').and.callThrough();
      mouseenterleaveBind(elem, 'mouseleave', '.js-foo', handler, {}, obj.bindEventFn);
      jasmineExpect(obj.bindEventFn).toHaveBeenCalledWith(elem, 'mouseout', '.js-foo', jasmine.any(Function), {});
    });
    it('should not call bindVirtualEvent when event is not mouseleave event', function() {
      var spy = jasmine.createSpy('spy');
      mouseenterleaveBind(elem, 'notmouseleave', '.js-foo', handler, {}, spy);
      jasmineExpect(spy).not.toHaveBeenCalled();
    });

  });
});
