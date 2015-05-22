'use strict';

var eventsCore = require('../events_core');
var eventWrapper = require('../tungsten_event');

/**
 * Read data to pass through for Scroll event to prevent repeated reads
 * @param  {Element} elem Target element of scroll event
 * @return {Object}       Scroll properties of element
 */
var getScrollData = function(elem) {
  return {
    x: elem.scrollX,
    y: elem.scrollY
  };
};

/**
 * [getSizeData description]
 * @param  {[type]} elem [description]
 * @return {[type]}      [description]
 */
var getSizeData = function(elem) {
  if (elem === window) {
    return {
      height: window.innerHeight,
      width: window.innerWidth
    };
  } else {
    return {
      height: elem.offsetHeight,
      width: elem.offsetWidth
    };
  }
};

var previousWindowData = {
  'scroll': getScrollData(window),
  'resize': getSizeData(window)
};

var windowEventHandler = function(nativeEvent) {
  var events = eventsCore.getEvents(window);
  // Window has a narrow scope of bindability
  var eventsToTrigger = events[nativeEvent.type].self;
  var evt = eventWrapper(nativeEvent);
  if (evt.type === 'scroll') {
    evt.previous = previousWindowData.scroll;
    evt.current = getScrollData(window);
    previousWindowData.scroll = evt.current;
  }
  var eventsToTriggerLength = eventsToTrigger.length;
  for (var i = 0; i < eventsToTriggerLength; i++) {
    eventsToTrigger[i].method(evt);
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