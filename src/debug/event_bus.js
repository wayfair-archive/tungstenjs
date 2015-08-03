'use strict';

var registeredEvents = {};

var eventBus = {};
eventBus.ALL = 'ALL';
eventBus.CHANGED_REGISTERED = 'CHANGED_REGISTERED';
eventBus.UPDATED_DOM_DIFF = 'UPDATED_DOM_DIFF';


eventBus.on = function(eventName, callback) {
  if (!registeredEvents[eventName]) {
    registeredEvents[eventName] = [callback];
  } else {
    var events = registeredEvents[eventName];
    for (var i = 0; i < events.length; i++) {
      if (events[i] === callback) {
        return;
      }
    }
    events.push(callback);
  }
};

eventBus.off = function(eventName, callback) {
  if (!registeredEvents[eventName]) {
    return;
  } else {
    var events = registeredEvents[eventName];
    for (var i = 0; i < events.length; i++) {
      if (events[i] === callback) {
        events.splice(i, 1);
        return;
      }
    }
    events.push(callback);
  }
};

eventBus.trigger = function(eventName) {
  var i;
  var args = new Array(arguments.length - 1);
  for (i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  var events = registeredEvents[eventName];
  if (events) {
    for (i = 0; i < events.length; i++) {
      events[i].apply(null, args);
    }
  }

  events = registeredEvents[eventBus.ALL];
  if (events) {
    args.unshift(eventName);
    for (i = 0; i < events.length; i++) {
      events[i].apply(null, args);
    }
  }
};

module.exports = eventBus;