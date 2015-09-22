'use strict';
var submitDataBind = require('../../../../src/event/handlers/submit_data_events.js');
describe('submit_events', function() {
  var elem, type, obj, handler;
  beforeEach(function() {
    elem = document.createElement('form');
    obj = {};
    handler = function() {};
  });
  afterEach(function() {
    elem = undefined, type = undefined, obj = undefined, handler = undefined;
  });
  it('should call bindVirtualEvent when event is submit-data', function() {
    obj.bindEventFn = function(el, eventName, selector, method) {
      method({
        currentTarget: elem,
        target: elem
      });
    };
    spyOn(obj, 'bindEventFn').and.callThrough();
    submitDataBind(elem, 'submit-data', '', handler, {}, obj.bindEventFn);
    expect(obj.bindEventFn.calls.count()).to.equal(2);
    jasmineExpect(obj.bindEventFn).toHaveBeenCalledWith(elem, 'click', 'js-submit', jasmine.any(Function), {});
    jasmineExpect(obj.bindEventFn).toHaveBeenCalledWith(elem, 'submit', '', jasmine.any(Function), {});
  });
  it('should not call bindVirtualEvent when event is submit, not submit-data', function() {
    var spy = jasmine.createSpy('spy');
    submitDataBind(elem, type + 'submit', '', handler, {}, spy);
    expect(spy.calls.count()).to.equal(0);
  });
});
