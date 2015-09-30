/**
 * Utility class to non-directly bind events
 */
'use strict';
var _ = require('underscore');
var eventsCore = require('./events_core');
require('./handlers/touch_events');

var eventHandlers = [
  require('./handlers/document_events'),
  require('./handlers/focus_events'),
  require('./handlers/mouseenter_events'),
  require('./handlers/window_events'),
  require('./handlers/intent_events'),
  require('./handlers/outside_events')
];
var registerEventPlugin = function(handler) {
  eventHandlers.push(handler);
};
var defaultEvents = require('./handlers/default_events');

/**
 * Returns a formatted list of events that are "bound" for this element
 * @param  {Element} element Element to find events for
 * @return {Object}          Formatted list of events for the element
 */
var getEventsForElement = function(element) {
  var path = eventsCore.getActiveClasses(element);
  path.self = element;
  var elem = element;

  var events;
  var eventMap = Object.create ? Object.create(null) : {};
  var currentType;
  var checkSelf = true;

  /**
   * Iterate over bindings for a particular event type
   * @param  {Object} bindings Hash of event bindings
   * @param  {String} evtType  Type of event to check
   */
  var checkEventTypes = function(bindings, evtType) {
    currentType = evtType;
    _.each(bindings, checkEvents);
  };

  /**
   * Iterate over specific binds to see if they apply to the current element
   * @param  {Object} handler   Object detailing handler methods
   * @param  {String} selector  Selector to match against
   */
  var checkEvents = function(handler, selector) {
    if ((checkSelf && selector === 'self') ||
      _.indexOf(path, selector) !== -1) {
      eventMap[currentType] = eventMap[currentType] || [];

      var thisEvent = Object.create ? Object.create(null) : {};
      thisEvent.type = currentType;
      thisEvent.handler = handler;
      thisEvent.selector = selector;
      if (selector !== 'self') {
        thisEvent.delegator = elem;
      }

      eventMap[currentType].push(thisEvent);
    }
  };

  // Iterate up the DOM tree to fire events as needed
  // @TODO figure out how to do this without DOM iteration
  while (elem) {
    events = eventsCore.getEvents(elem);
    _.each(events, checkEventTypes);
    elem = elem.parentNode;
    checkSelf = false;
  }

  var flatEvents = Object.create ? Object.create(null) : {};
  _.each(eventMap, function(events, type) {
    var i = 0;
    _.each(events, function(eventsOfType) {
      _.each(eventsOfType.handler, function(handler) {
        var evt = _.clone(eventsOfType);
        evt.handler = handler;
        flatEvents[type + '.' + (i++)] = evt;
      });
    });
  });

  return flatEvents;
};

// Export this function globally for use in debugging
window.getEventsForElement = getEventsForElement;

/**
 * Adds a new event binding
 * @param  {Element}  el        Element to bind to
 * @param  {String}   eventName Event name to bind
 * @param  {String}   selector  Child class if the event is delegated
 * @param  {Function} method    Function to execute
 * @param  {Object}   options   Options to configure the event handlers
 */
var bindVirtualEvent = function(el, eventName, selector, method, options) {
  var result = null;
  var eventHandlersLength = eventHandlers.length;
  for (var i = 0; i < eventHandlersLength; i++) {
    // bindVirtualEvent is passed in, in case something needs to recurse
    result = eventHandlers[i](el, eventName, selector, method, options, bindVirtualEvent);
    if (result) {
      break;
    }
  }

  if (!result) {
    result = defaultEvents(el, eventName, selector, method, options);
  }

  return result;
};

/**
 * Remove bound events
 * @param  {Array<Any>}  evt  Event to unbind
 */
var unbindVirtualEvent = function(evt) {
  eventsCore.removeEvent(evt);
};

module.exports = {
  getEventsForElement: getEventsForElement,
  validateSelector: eventsCore.validateSelector,
  bindVirtualEvent: bindVirtualEvent,
  unbindVirtualEvent: unbindVirtualEvent,
  registerEventHandler: registerEventPlugin,
  // Exposing for testing purposes, should not be directly accessed
  _eventHandlers: eventHandlers
};
