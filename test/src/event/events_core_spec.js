'use strict';
/* global describe, it, require, beforeEach */
var eventsCore = require('../../../src/event/events_core.js');

// [ 'validateSelector',
//   'getEvents',
//   'setEvents',
//   'addEvent',
//   'removeEvent',
//   'getActiveClasses',
//   'bindEventType' ]

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
  });
  describe('removeEvent', function() {
    it('should be a function', function() {
      expect(eventsCore.removeEvent).to.be.a('function');
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
  });

});
