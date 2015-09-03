'use strict';
/* global describe, it, require, beforeEach */
var eventsCore = require('../../../src/event/events_core.js');

describe('events_core.js public API', function() {
  describe('validateSelector', function() {
    var getValidator;
    beforeEach(function() {
      getValidator = function(selector) {
        return function() {
          eventsCore.validateSelector(selector);
        };
      };
    });

    it('should be a function', function() {
      expect(eventsCore.validateSelector).to.be.a('function');
    });
    it('should allow js class names or empty', function() {
      expect(getValidator('')).not.to.throw(/Delegated virtual events/);
      expect(getValidator('.js-test')).not.to.throw(/Delegated virtual events/);
    });
    it('should not allow other selectors', function() {
      expect(getValidator('.test')).to.throw(/Delegated virtual events/);
      expect(getValidator('#js-test')).to.throw(/Delegated virtual events/);
      expect(getValidator('.js-test:hover')).to.throw(/Delegated virtual events/);
      expect(getValidator('.js-test[data-test]')).to.throw(/Delegated virtual events/);
    });
  });
  var elem, type, handler;
  beforeEach(function() {
    elem = document.createElement('div');
    type = 'click';
    handler = function() {};
  });
  describe('getEvents', function() {
    it('should be a function', function() {
      expect(eventsCore.getEvents).to.be.a('function');
    });
  });
  describe('setEvents', function() {
    it('should be a function', function() {
      expect(eventsCore.setEvents).to.be.a('function');
    });
  });
  describe('addEvent', function() {
    it('should be a function', function() {
      expect(eventsCore.addEvent).to.be.a('function');
    });
    it('should bind a virtual event', function() {
      var selector = 'self';
      var result = eventsCore.addEvent(elem, type, selector, handler);
      
      expect(result).to.deep.equal([elem, type, selector, handler]);

      var events = eventsCore.getEvents(elem);
      var expectedEvents = {};
      expectedEvents[type] = {};
      expectedEvents[type][selector] = [{
        method: handler
      }];

      expect(events).to.deep.equal(expectedEvents);
    });
  });
  describe('removeEvent', function() {
    it('should be a function', function() {
      expect(eventsCore.removeEvent).to.be.a('function');
      expect(eventsCore.removeEvent.length).to.equal(1);
    });
    it('should expect an array with four elements', function() {
      spyOn(global._console, 'warn');
      eventsCore.removeEvent([elem, null, null, null]);
      jasmineExpect(global._console.warn).not.toHaveBeenCalled();

      function faultyCall(evt) {
        global._console.warn.calls.reset();
        eventsCore.removeEvent(evt);
        jasmineExpect(global._console.warn).toHaveBeenCalledWith(
          'Object does not meet expected event spec',
          evt
        );
      }
      faultyCall([null, null, null]);
      faultyCall({});
      faultyCall({length: 4});
    });
    describe('unbindingEvents', function() {
      var event1, event2, expectedEvents;
      beforeEach(function() {
        event1 = eventsCore.addEvent(elem, type, 'self', handler);
        event2 = eventsCore.addEvent(elem, type, 'js-test', handler);

        expectedEvents = {};
        expectedEvents[type] = {};
        expectedEvents[type]['self'] = [{ method: handler }];
        expectedEvents[type]['js-test'] = [{ method: handler }];
      });
      it('should remove a specific virtual event', function() {
        eventsCore.removeEvent(event1);

        var events = eventsCore.getEvents(elem);
        expectedEvents[type]['self'] = [];

        expect(events).to.deep.equal(expectedEvents);
      });
      it('should remove multiple virtual events', function() {
        eventsCore.removeEvent([event1, event2]);

        var events = eventsCore.getEvents(elem);
        expectedEvents[type]['self'] = [];
        expectedEvents[type]['js-test'] = [];

        expect(events).to.deep.equal(expectedEvents);
      });
      it('should remove all events', function() {
        eventsCore.removeEvent([elem, null, null, null]);

        var events = eventsCore.getEvents(elem);
        expectedEvents = {};

        expect(events).to.deep.equal(expectedEvents);
      });
      it('should remove events by type', function() {
        eventsCore.removeEvent([elem, type, null, null]);

        var events = eventsCore.getEvents(elem);
        expectedEvents[type] = {};

        expect(events).to.deep.equal(expectedEvents);
      });
      it('should remove events by selector', function() {
        eventsCore.removeEvent([elem, null, 'self', null]);

        var events = eventsCore.getEvents(elem);
        expectedEvents[type]['self'] = [];

        expect(events).to.deep.equal(expectedEvents);
      });
      it('should remove events by handler', function() {
        eventsCore.removeEvent([elem, null, null, handler]);

        var events = eventsCore.getEvents(elem);
        expectedEvents[type]['self'] = [];
        expectedEvents[type]['js-test'] = [];

        expect(events).to.deep.equal(expectedEvents);
      });
    });
  });
  describe('getActiveClasses', function() {
    it('should be a function', function() {
      expect(eventsCore.getActiveClasses).to.be.a('function');
    });

    it('should return an array of js- classes', function() {
      var classes = eventsCore.getActiveClasses({
        className: 'js-test1 test2 js-test3'
      });
      expect(classes).to.be.instanceof(Array);
      expect(classes.length).to.equal(2);
      expect(classes).members(['js-test1', 'js-test3']);

      classes = eventsCore.getActiveClasses({
        className: 'test1 test2 test3'
      });
      expect(classes).to.be.instanceof(Array);
      expect(classes.length).to.equal(0);
    });
  });
  describe('bindEventType', function() {
    it('should be a function', function() {
      expect(eventsCore.bindEventType).to.be.a('function');
    });
    it('should bind events to the given element', function() {
      spyOn(elem, 'addEventListener');
      eventsCore.bindEventType(elem, type, handler);
      jasmineExpect(elem.addEventListener).toHaveBeenCalledWith(type, handler, true);
    });
    it('should not bind duplicate events to the given element', function() {
      spyOn(elem, 'addEventListener');
      eventsCore.bindEventType(elem, type, handler);
      jasmineExpect(elem.addEventListener).toHaveBeenCalledWith(type, handler, true);

      // Clear spy
      elem.addEventListener.calls.reset();
      eventsCore.bindEventType(elem, type, handler);
      jasmineExpect(elem.addEventListener).not.toHaveBeenCalled();
    });
    it('should support old IE', function() {
      elem.attachEvent = elem.addEventListener;
      elem.addEventListener = null;
      spyOn(elem, 'attachEvent');
      eventsCore.bindEventType(elem, type, handler);
      jasmineExpect(elem.attachEvent).toHaveBeenCalledWith('on' + type, handler);
    });
  });

});
