'use strict';
/* global describe, it, require, beforeEach */
var mouseenterBind = require('../../../../src/event/handlers/mouseenter_events.js');

describe('mouseenter_events', function() {
  var elem, handler;
  beforeEach(function() {
    elem = document.createElement('div');
    handler = function() {};
  });
  afterEach(function() {
    elem = undefined, handler = undefined;
  });
  it('should call bindVirtualEvent with mouseenter event', function() {
    var spy = jasmine.createSpy('spy');
    mouseenterBind(elem, 'mouseenter', '.js-foo', handler, {}, spy);
    jasmineExpect(spy).toHaveBeenCalledWith(elem, 'mouseover', '.js-foo', jasmine.any(Function), {});
  });
  it('should not call bindVirtualEvent when event is not mouseenter event', function() {
    var spy = jasmine.createSpy('spy');
    mouseenterBind(elem, 'notmouseenter', '.js-foo', handler, {}, spy);
    jasmineExpect(spy).not.toHaveBeenCalled();
  });

});

describe('mouseleave_events', function() {
  var elem, handler;
  beforeEach(function() {
    elem = document.createElement('div');
    handler = function() {};
  });
  afterEach(function() {
    elem = undefined, handler = undefined;
  });
  it('should call bindVirtualEvent with mouseleave event', function() {
    var spy = jasmine.createSpy('spy');
    mouseenterBind(elem, 'mouseleave', '.js-foo', handler, {}, spy);
    jasmineExpect(spy).toHaveBeenCalledWith(elem, 'mouseout', '.js-foo', jasmine.any(Function), {});
  });
  it('should not call bindVirtualEvent when event is not mouseleave event', function() {
    var spy = jasmine.createSpy('spy');
    mouseenterBind(elem, 'notmouseleave', '.js-foo', handler, {}, spy);
    jasmineExpect(spy).not.toHaveBeenCalled();
  });

});
