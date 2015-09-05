'use strict';

require('./environment.js');

var events = require('jsdom-nogyp/lib/jsdom/level2/events.js').dom.level2.events;

// Override jsdom-nogyp's implementation of dispatchEvent is slightly broken
// the following two functions are taken from the latest version of JSDOM
// https://github.com/tmpvar/jsdom/blob/e3ee5d0267dcad424e9e1b27b8891b129fc66975/lib/jsdom/events/EventTarget.js#L167
function callListeners(event, target, listeners) {
  var currentListener = listeners.length;
  while (currentListener--) {
    event._currentTarget = target;
    try {
      listeners[currentListener].call(target, event);
    } catch (e) {
      var win = target._document ? target : target._ownerDocument._defaultView;

      if (win) {
        reportException(win, e);
      }
      // Errors in window-less documents just get swallowed... can you think of anything better?
    }
  }
}

// https://github.com/tmpvar/jsdom/blob/e3ee5d0267dcad424e9e1b27b8891b129fc66975/lib/jsdom/events/EventTarget.js#L153
events.EventTarget.dispatch = function dispatch(event, iterator) {
  var target = iterator();

  while (target && !event._stopPropagation) {
    if (event._eventPhase === event.CAPTURING_PHASE || event._eventPhase === event.AT_TARGET) {
      callListeners(event, target, events.EventTarget.getListeners(target, event._type, true));
    }
    if (event._eventPhase === event.AT_TARGET || event._eventPhase === event.BUBBLING_PHASE) {
      callListeners(event, target, events.EventTarget.getListeners(target, event._type, false));
    }
    target = iterator();
  }
  return !event._stopPropagation;
};

var doc = global.document;

function extend(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
}

var eventMatchers = {
  'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
  'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
};

var defaultOptions = {
  pointerX: 0,
  pointerY: 0,
  button: 0,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  bubbles: true,
  cancelable: true
};

var triggerElement = doc.createElement('div');

// Setup helper for triggering DOM events
// Code taken from http://stackoverflow.com/questions/6157929/how-to-simulate-a-mouse-click-using-javascript/6158050#6158050
global.triggerEvent = function(element, eventName, opts) {
  var options = extend(defaultOptions, opts || {});
  var oEvent, eventType = null;

  for (var name in eventMatchers) {
    if (eventMatchers[name].test(eventName)) {
      eventType = name;
      break;
    }
  }

  if (!eventType) {
    throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
  }

  if (doc.createEvent) {
    oEvent = doc.createEvent(eventType);
    if (eventType == 'HTMLEvents') {
      oEvent.initEvent(eventName, options.bubbles, options.cancelable);
    } else {
      oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, doc.defaultView,
        options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
        options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
    }

    // JSDom triggers capture events without the target element, so trigger from one "below"
    // triggerElement._parentNode = element === window ? document.body : element;
    element.dispatchEvent(oEvent);
  } else {
    options.clientX = options.pointerX;
    options.clientY = options.pointerY;
    var evt = doc.createEventObject();
    oEvent = extend(evt, options);
    element.fireEvent('on' + eventName, oEvent);
  }
  return element;
};