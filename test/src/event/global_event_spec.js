'use strict';

var eventsCore = require('../../../src/event/events_core.js');
var globalEvents = require('../../../src/event/global_events.js');
var documentEvents = require('../../../plugins/tungsten-event-document');
var defaultEvents = require('../../../src/event/handlers/default_events.js');

describe('global_event.js public api', function () {
  beforeAll(function() {
    globalEvents.addEventPlugin(documentEvents);
  });
  describe('_eventHandlers', function () {
    it('should be an array', function() {
      expect(globalEvents._eventHandlers).to.be.a('array');
    });
  });
  describe('addEventPlugin', function () {
    it('should be a function', function() {
      expect(globalEvents.addEventPlugin).to.be.a('function');
      expect(globalEvents.addEventPlugin).to.have.length(1);
    });
    it('should push to eventHandlers', function() {
      var startingLength = globalEvents._eventHandlers.length;
      var fn = function() {};
      globalEvents.addEventPlugin(fn);
      expect(globalEvents._eventHandlers).to.have.length(startingLength + 1);
      expect(globalEvents._eventHandlers[globalEvents._eventHandlers.length - 1]).to.equal(fn);
    });
  });
  describe('bindVirtualEvent', function () {
    it('should be a function', function() {
      expect(globalEvents.bindVirtualEvent).to.be.a('function');
      expect(globalEvents.bindVirtualEvent).to.have.length(5);
    });
    var el, eventName, selector, method, options;
    beforeEach(function () {
      el = document.createElement('div');
      eventName = 'foo';
      selector = 'self';
      method = function() {};
      options = {};
    });
    afterEach(function () {
      el = undefined;
      eventName = undefined;
      selector = undefined;
      method = undefined;
      options = undefined;
    });
    it ('should call custom handlers', function() {
      var expected = documentEvents(el, 'doc-' + eventName, selector, method, options, globalEvents.bindVirtualEvent);
      var actual = globalEvents.bindVirtualEvent(el, 'doc-' + eventName, selector, method, options);

      expect(expected).to.deep.equal(actual);
    });
    it ('should fall back to default handler', function() {
      var expected = defaultEvents(el, eventName, selector, method, options, globalEvents.bindVirtualEvent);
      var actual = globalEvents.bindVirtualEvent(el, eventName, selector, method, options);

      expect(expected).to.deep.equal(actual);
    });
  });
  describe('unbindVirtualEvent', function () {
    it('should be a function', function() {
      expect(globalEvents.unbindVirtualEvent).to.be.a('function');
      expect(globalEvents.unbindVirtualEvent).to.have.length(1);
    });
    it('should call eventsCore.removeEvent', function() {
      spyOn(eventsCore, 'removeEvent');
      var evt = {};
      globalEvents.unbindVirtualEvent(evt);
      jasmineExpect(eventsCore.removeEvent).toHaveBeenCalledWith(evt);
    });
  });
  describe('getEventsForElement', function () {
    it('should be a function', function() {
      expect(globalEvents.getEventsForElement).to.be.a('function');
      expect(globalEvents.getEventsForElement).to.have.length(1);
    });
    it('should get events for given element', function() {
      var elClass = 'js-foo';
      var outerEl = document.createElement('div');
      var el = outerEl.appendChild(document.createElement('div'));
      el.className = elClass;
      var selfMethod = function() {};
      var delegateMethod = function() {};
      globalEvents.bindVirtualEvent(el, 'foo', 'self', selfMethod, {});
      globalEvents.bindVirtualEvent(outerEl, 'bar', elClass, delegateMethod, {});

      var result = globalEvents.getEventsForElement(el);
      expect(result).to.deep.equal({
        'foo.0': {
          type: 'foo',
          handler: {
            method: selfMethod
          },
          selector: 'self'
        },
        'bar.0': {
          type: 'bar',
          handler: {
            method: delegateMethod
          },
          selector: elClass,
          delegator: outerEl
        }
      });
    });
  });
});
