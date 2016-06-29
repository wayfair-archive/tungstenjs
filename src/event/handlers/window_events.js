/**
 * Module to bind to common window events
 */
'use strict';

var window = require('global/window');
var document = require('global/document');
var eventsCore = require('../events_core');
var eventWrapper = require('../tungsten_event');

/**
 * Read data to pass through for Scroll event to prevent repeated reads
 * @return {Object}       Scroll properties of element
 */
var getScrollData = function() {
  var doc = document.documentElement;
  return {
    x: (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
    y: (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0)
  };
};

/**
 * Get size data of element
 * @return {object}      object containing size data
 */
var getSizeData = function() {
  return {
    height: window.innerHeight,
    width: window.innerWidth
  };
};

var previousWindowData = {
  'scroll': getScrollData(window),
  'resize': getSizeData(window)
};

var windowEventHandler = function(nativeEvent) {
  var events = eventsCore.getEvents(window);
  // Window has a narrow scope of bindability
  if (events[nativeEvent.type]) {
    var eventsToTrigger = events[nativeEvent.type].self;
    var evt = eventWrapper(nativeEvent);
    if (evt.type === 'scroll') {
      evt.previous = previousWindowData.scroll;
      evt.current = getScrollData();
      previousWindowData.scroll = evt.current;
    } else if (evt.type === 'resize') {
      evt.previous = previousWindowData.resize;
      evt.current = getSizeData();
      previousWindowData.resize = evt.current;
    }
    var eventsToTriggerLength = eventsToTrigger.length;
    for (var i = 0; i < eventsToTriggerLength; i++) {
      eventsToTrigger[i].method(evt);
    }
  }
};

module.exports = function(el, eventName, selector, method, options) {
  if (eventName.substr(0, 4) === 'win-') {
    var realEventName = eventName.substr(4);

    eventsCore.bindEventType(window, realEventName, windowEventHandler, options);
    // Add the event and return arguments to call unbind with
    return eventsCore.addEvent(window, realEventName, 'self', method, options);
  }
};
