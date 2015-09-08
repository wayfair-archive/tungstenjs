'use strict';

var focusEvents = require('../../../../src/event/handlers/focus_events.js');

describe('focus events', function() {
  var elem, handler, opts;
  var originalValue;
  beforeEach(function() {
    originalValue = focusEvents.nativeFocusin;
    focusEvents.nativeFocusin = true;
    elem = document.createElement('div');
    handler = function() {};
    opts = {};
  });
  afterEach(function() {
    focusEvents.nativeFocusin = originalValue;
    elem = undefined;
    handler = undefined;
    opts = undefined;
  });
  it('should be a function', function() {
    expect(focusEvents).to.be.a('function');
    expect(focusEvents).to.have.length(6);
  });
  it('should call bindVirtualEvent with \'focusout\' when event is called blur', function() {
    var spy = jasmine.createSpy('spy');
    focusEvents(elem, 'blur', '', handler, opts, spy);
    var args = spy.calls.argsFor(0);
    expect(args).to.have.length(5);
    expect(args).to.include.members(['focusout']);
    args = undefined;
  });
  it('should call bindVirtualEvent with \'focusout\' when event is called focus', function() {
    var spy = jasmine.createSpy('spy');
    focusEvents(elem, 'focus', '', handler, opts, spy);
    var args = spy.calls.argsFor(0);
    expect(args).to.have.length(5);
    expect(args).to.include.members(['focusin']);
    args = undefined;
  });
});
