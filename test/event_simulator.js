'use strict';

require('./environment.js');

var doc = global.document;

function extend(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
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