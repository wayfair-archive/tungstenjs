'use strict';

var intentEvents = require('../../../../src/event/handlers/intent_events.js');
var globalEvents = require('../../../../src/event/global_events.js');

describe('intent events', function() {
  var elem, type, handler, opts;
  beforeEach(function() {
    elem = document.createElement('div');
    type = 'keydown';
    handler = function() {};
    opts = {};
  });
  afterEach(function() {
    elem = undefined;
    type = undefined;
    handler = undefined;
    opts = undefined;
  });
  it('should be a function', function() {
    expect(intentEvents).to.be.a('function');
    expect(intentEvents).to.have.length(6);
  });
  it('should call bindVirtualEvent when event is postfixed with -intent', function() {
    var spy = jasmine.createSpy('spy');
    intentEvents(elem, type + '-intent', '', handler, opts, spy);
    expect(spy.calls.count()).to.equal(2);

    // First re-call binds initial event
    var firstArgs = spy.calls.argsFor(0);
    expect(firstArgs).to.have.length(5);
    expect(firstArgs).to.include.members([elem, type, '', opts]);

    // Second re-call binds a global opposite
    var secondArgs = spy.calls.argsFor(1);
    expect(secondArgs).to.have.length(5);
    expect(secondArgs).to.include.members([document, 'keyup', '', opts]);
  });
  it('should not call bindVirtualEvent when event is not postfixed with -intent', function() {
    var spy = jasmine.createSpy('spy');
    intentEvents(elem, type + '-foo', '', handler, {}, spy);
    jasmineExpect(spy).not.toHaveBeenCalled();
  });
  it('should throw when an unexpected event is postfixed with -intent', function() {
    var test = function() {
      intentEvents(elem, 'foo-intent', '', handler, {}, handler);
    };
    expect(test).to.throw(/^Unexpected intent event/);
  });
  it('should not trigger when the opposite event is triggered', function(done) {
    var handler = jasmine.createSpy('intent handler');
    intentEvents(document.body, 'mousedown-intent', 'self', handler, opts, globalEvents.bindVirtualEvent);
    global.triggerEvent(document.body, 'mousedown');
    global.triggerEvent(document.body, 'mouseup');
    setTimeout(function() {
      jasmineExpect(handler).not.toHaveBeenCalled();
      done();
    }, 500);
  });
  it('should trigger when the opposite event is not triggered', function(done) {
    var handler = jasmine.createSpy('intent handler');
    intentEvents(document.body, 'mousedown-intent', 'self', handler, opts, globalEvents.bindVirtualEvent);
    global.triggerEvent(document.body, 'mousedown');
    setTimeout(function() {
      jasmineExpect(handler).toHaveBeenCalled();
      done();
    }, 500);
  });
  it('should trigger when the opposite event is triggered too late', function(done) {
    var handler = jasmine.createSpy('intent handler');
    intentEvents(document.body, 'mousedown-intent', 'self', handler, opts, globalEvents.bindVirtualEvent);
    global.triggerEvent(document.body, 'mousedown');
    setTimeout(function() {
      global.triggerEvent(document.body, 'mouseup');
    }, 500);
    setTimeout(function() {
      jasmineExpect(handler).toHaveBeenCalled();
      done();
    }, 700);
  });
});