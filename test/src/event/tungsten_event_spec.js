'use strict';

/* global describe, it, require */
var tungstenEvent = require('../../../src/event/tungsten_event.js');
describe('tungsten_event.js public api', function () {
  it('should be a function', function () {
    expect(tungstenEvent).to.be.a('function');
    expect(tungstenEvent.length).to.equal(1);
  });
  it('should create an event', function() {
    var evt = tungstenEvent({});
    expect(evt).to.be.instanceof(tungstenEvent._constructor);
  });
  it('should be recyclable', function() {
    var evt1 = tungstenEvent({});
    var evt1Id = evt1.eventId;
    evt1.recycle();
    var evt2 = tungstenEvent({});
    // Pointer to object should be identical
    expect(evt1 === evt2).to.be.true;
    // But the eventId is updated
    expect(evt1Id).not.to.equal(evt2.eventId);
  });
  it('should have a unique eventId', function() {
    var evt1 = tungstenEvent({});
    var evt2 = tungstenEvent({});
    expect(evt1.eventId).to.be.a('string');
    expect(evt2.eventId).to.be.a('string');
    expect(evt1.eventId).not.to.equal(evt2.eventId);
  });
  it('should preventDefault', function() {
    var preventDefaultSpy = jasmine.createSpy('preventDefaultSpy');
    var evt = tungstenEvent({
      preventDefault: preventDefaultSpy
    });

    evt.preventDefault();
    jasmineExpect(preventDefaultSpy).toHaveBeenCalled();
  });
  it('should fall back to returnValue', function() {
    var originalEvent = {};
    var evt = tungstenEvent(originalEvent);

    evt.preventDefault();
    expect(originalEvent.returnValue).to.be.false;
  });
  it('should fake stopPropagation', function() {
    var stopPropagationSpy = jasmine.createSpy('stopPropagationSpy');
    var evt = tungstenEvent({
      stopPropagation: stopPropagationSpy
    });

    expect(evt.propagationStopped).to.be.false;
    expect(evt.isPropagationStopped()).to.be.false;
    evt.stopPropagation();
    jasmineExpect(stopPropagationSpy).not.toHaveBeenCalled();
    expect(evt.propagationStopped).to.be.true;
    expect(evt.isPropagationStopped()).to.be.true;
  });
  it('should fake stopImmediatePropagation', function() {
    var stopImmediatePropagationSpy = jasmine.createSpy('stopImmediatePropagationSpy');
    var evt = tungstenEvent({
      stopImmediatePropagation: stopImmediatePropagationSpy
    });

    expect(evt.immediatePropagationStopped).to.be.false;
    expect(evt.isImmediatePropagationStopped()).to.be.false;
    evt.stopImmediatePropagation();
    jasmineExpect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
    expect(evt.immediatePropagationStopped).to.be.true;
    expect(evt.isImmediatePropagationStopped()).to.be.true;
  });
});