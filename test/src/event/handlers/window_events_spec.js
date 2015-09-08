'use strict';
var windowBind = require('../../../../src/event/handlers/window_events.js');
var eventsCore = require('../../../../src/event/events_core.js');

describe('window_events', function() {
  var elem, type, handler;
  beforeEach(function() {
    eventsCore.removeEvent([window, null, null, null]);
    elem = document.createElement('div');
    type = 'resize';
    handler = function() {
      global._console.log('whooooo');
    };
  });
  afterEach(function() {
    elem = undefined, type = undefined, handler = undefined;
  });
  it('should call addEvent when event is prefixed with win-', function() {
    spyOn(eventsCore, 'addEvent');
    windowBind(elem, 'win-' + type, 'js-test', handler, {});
    jasmineExpect(eventsCore.addEvent).toHaveBeenCalledWith(window, type, 'self', handler, {});
    global.triggerEvent(window, type);
  });
  it('should not call addEvent when event is not prefixed with win-', function() {
    spyOn(eventsCore, 'addEvent');
    windowBind(elem, 'foo-' + type, '', handler, {});
    jasmineExpect(eventsCore.addEvent).not.toHaveBeenCalled();
  });
  describe('should run events when triggered', function() {
    var spyHandler;
    beforeEach(function() {
      spyHandler = jasmine.createSpy('handler');
    });
    it('should handle resize', function() {
      var type = 'resize';
      windowBind(elem, 'win-' + type, 'self', spyHandler, {});
      global.triggerEvent(window, type);
      jasmineExpect(spyHandler).toHaveBeenCalled();
      expect(spyHandler.calls.count()).to.equal(1);
      var event = spyHandler.calls.mostRecent().args[0];
      expect(event.type).to.equal(type);
      expect(event.current).to.be.a('object');
      expect(event.previous).to.be.a('object');
    });
    it('should handle scroll', function() {
      var type = 'scroll';
      windowBind(elem, 'win-' + type, 'self', spyHandler, {});
      global.triggerEvent(window, type);
      jasmineExpect(spyHandler).toHaveBeenCalled();
      expect(spyHandler.calls.count()).to.equal(1);
      var event = spyHandler.calls.mostRecent().args[0];
      expect(event.type).to.equal(type);
      expect(event.current).to.be.a('object');
      expect(event.previous).to.be.a('object');
    });
    it('should handle other events without additional data', function() {
      var type = 'click';
      windowBind(elem, 'win-' + type, 'self', spyHandler, {});
      global.triggerEvent(window, type);
      jasmineExpect(spyHandler).toHaveBeenCalled();
      expect(spyHandler.calls.count()).to.equal(1);
      var event = spyHandler.calls.mostRecent().args[0];
      expect(event.type).to.equal(type);
      expect(event.current).to.be.undefined;
      expect(event.previous).to.be.undefined;
    });
  });
});
