'use strict';

var dataset = require('data-set');
var eventWrapper = require('./tungsten_event');
var _ = require('underscore');
var isArray = require('../utils/is_array');
var logger = require('../utils/logger');

module.exports = {};

/**
 * Validates the given selector as a valid js- class
 * Throws an exception if not
 * @param  {String} selector Selector to validate
 */
module.exports.validateSelector = function(selector) {
  if (selector === '') {
    return;
  }

  var validSelector = true;
  validSelector = validSelector && selector.substr(0, 4) === '.js-';
  validSelector = validSelector && selector.indexOf('#') === -1;
  validSelector = validSelector && selector.indexOf(':') === -1;
  validSelector = validSelector && selector.indexOf('[') === -1;
  validSelector = validSelector && selector.indexOf('.', 1) === -1;

  if (!validSelector) {
    throw new Error('Delegated virtual events can only use a single "js-" class selector. ' + selector + ' is invalid');
  }
};

/**
 * Returns the event object bound for the given element
 * @param  {Element} elem  DOM node to get events object for
 * @return {Object}        Event object bound to the element
 */
module.exports.getEvents = function(elem) {
  var data = dataset(elem);
  if (!data.events) {
    data.events = {};
  }
  return data.events;
};

/**
 * Binds the given event object to the given element
 * @param {Element} elem    DOM node to set events object for
 * @param {Object}  events  Event object to bind to the element
 */
module.exports.setEvents = function(elem, events) {
  var data = dataset(elem);
  data.events = events;
};

var removeSelectorMethods = function (methods, method) {
  if (!method) {
    // If we aren't filtering on method, just blow away all bound methods
    return [];
  } else {
    // If we have a method to unbind, find it and remove it from the bound handlers
    for (var i = methods.length; i--;) {
      if (methods[i].method === method) {
        // If we got down here, remove the event
        methods.splice(i, 1);
        break;
      }
    }
    return methods;
  }
};

var removeEventTypes = function (selectorMap, selector, method) {
  if (selector) {
    // If we're unbinding a specific selector, iterate into that
    if (selectorMap[selector]) {
      selectorMap[selector] = removeSelectorMethods(selectorMap[selector], method);
    }
  } else if (!selector && !method) {
    // if no filtering takes place, just blow away all bound selectors
    return {};
  } else {
    // If we have any filter parameters, but not selector, loop over all bound selectors
    _.each(selectorMap, function(boundMethods, boundSelector) {
      selectorMap[boundSelector] = removeSelectorMethods(boundMethods, method);
    });
  }
  return selectorMap;
};

var removeElementEvents = function(el, eventName, selector, method) {
  var eventMap = module.exports.getEvents(el);

  if (eventName) {
    // If we're unbinding a specific eventName, iterate into that
    if (eventMap[eventName]) {
      eventMap[eventName] = removeEventTypes(eventMap[eventName], selector, method);
    }
  } else if (!eventName && !selector && !method) {
    // if no filtering takes place, just blow away all bound events
    module.exports.setEvents(el, {});
  } else {
    // If we have any filter parameters, but not eventName, loop over all bound event types
    _.each(eventMap, function(selectors, boundEventName) {
      eventMap[boundEventName] = removeEventTypes(selectors, selector, method);
    });
  }
};

/**
 * Add a given event to the event data object
 * @param {Element}  el        Element to add the event to
 * @param {String}   eventName Name of the event to listen for
 * @param {String}   selector  Selector string or 'self'
 * @param {Function} method    Method to trigger
 */
module.exports.addEvent = function(el, eventName, selector, method) {
  var eventMap = module.exports.getEvents(el, 'events');
  var events = eventMap[eventName] = eventMap[eventName] || {};
  var selectorEvents = events[selector] = events[selector] || [];
  selectorEvents.push({
    method: method
  });

  module.exports.setEvents(el, eventMap);

  return [el, eventName, selector, method];
};

module.exports.removeEvent = function (evt) {
  if (isArray(evt)) {
    if (isArray(evt[0])) {
      // Some plugins may bind multiple handlers, in which case we have an array of arrays
      for (var i = evt.length; i--; ) {
        module.exports.removeEvent(evt[i]);
      }
    } else if (evt.length === 4) {
      removeElementEvents(evt[0], evt[1], evt[2], evt[3]);
    } else {
      logger.warn('Object does not meet expected event spec', evt);
    }
  }
};


/**
 * Returns an array of the js- classes on this element
 * @param  {Element}       element DomNode to parse
 * @return {Array<String>}         Array of the js- classes
 */
module.exports.getActiveClasses = function(element) {
  var classList = (element.className || '').split(/\s/);
  var className;
  var activeClasses = {};
  for (var i = classList.length; i--;) {
    className = classList[i];
    if (className.substr(0, 3) === 'js-') {
      activeClasses[className] = [element];
    }
  }
  return _.keys(activeClasses);
};


/**
 * Function to bind / run for bindings that are set to or return false
 * @param  {Event} evt Event to run against
 */
var falseHandler = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();
};

/**
 * Function bound to all global level events
 */
var defaultEventHandler = function(nativeEvent) {
  var evt = eventWrapper(nativeEvent);
  var activePath = [];
  var elem = evt.target;
  var events;

  /**
   * Handle calling bound functions with the proper targets set
   * @TODO move this outside eventHandler
   * @param  {Element}         elem      DOM element to trigger events on
   * @param  {Array<Function>} funcArr   Array of bound functions to trigger
   * @param  {String}          selector  Selector string that the event was bound to
   * @param  {Element}         delegate  DOM element this event was bound to for delegation
   */
  var triggerEventFunctions = function(elem, funcArr, selector, delegate) {
    var result;
    evt.currentTarget = elem;
    evt.delegateTarget = delegate;
    for (var i = 0; i < funcArr.length; i++) {
      if (!evt.isImmediatePropagationStopped()) {
        evt.vEvent = {
          handler: funcArr[i].method,
          selector: selector
        };

        result = funcArr[i].method(evt);
        if (result === false) {
          falseHandler(evt);
        }
      }
    }
  };

  /**
   * Checks if bound events should fire
   * @param  {Object}    typeEvents        Event object of events to check if should fire
   */
  var checkEvents = function(typeEvents) {
    var elemClasses, elemClass;

    // Iterate over previously passed elements to check for any delegated events
    var activePathLength = activePath.length;
    for (var i = 0; i < activePathLength; i++) {
      elemClasses = activePath[i].classes;
      // Once stopPropagation is called stop
      if (!evt.isPropagationStopped()) {
        var elemClassesLength = elemClasses.length;
        for (var j = 0; j < elemClassesLength; j++) {
          elemClass = elemClasses[j];
          if (typeEvents[elemClass]) {
            triggerEventFunctions(activePath[i].element, typeEvents[elemClass], elemClass, elem);
          }
        }
      }
    }

    // Check for any non-delegated events
    if (!evt.isPropagationStopped() && typeEvents.self) {
      triggerEventFunctions(elem, typeEvents.self);
    }
  };

  while (elem && !evt.isPropagationStopped()) {
    events = module.exports.getEvents(elem);
    if (events) {
      // Generic events
      if (events[evt.type]) {
        checkEvents(events[evt.type]);
      }
    }
    // Create array of class names that match our pattern to check for delegation later
    var elemActiveClasses = module.exports.getActiveClasses(elem);
    if (elemActiveClasses.length) {
      activePath.push({
        element: elem,
        classes: elemActiveClasses
      });
    }
    elem = elem.parentNode;
  }
};


/**
 * Wrapper to add event listener
 * @param {String}   eventName Name of event to attach
 * @param {Function} handler   Function to bind
 * @param {Element}  elem      Element to bind to
 */
var bindDomEvent = function(eventName, handler, elem) {
  if (elem.addEventListener) {
    // Setting useCapture to true so that this virtual handler is always fired first
    // Also handles events that don't bubble correctly like focus/blur
    elem.addEventListener(eventName, handler, true);
  } else {
    elem.attachEvent('on' + eventName, handler);
  }
};

/**
 * Adds a global binding for requested event types that aren't already bound
 * @param  {Element}  elem     Element to bind to
 * @param  {String}   type     Event name to bind
 * @param  {Function} handler  Function to bind with if not using default
 */
module.exports.bindEventType = function(elem, type, handler) {
  // Ensure only one binding per eventName is set
  var data = dataset(elem);
  data.boundEvents = data.boundEvents || {};

  if (!data.boundEvents[type]) {
    data.boundEvents[type] = true;
    bindDomEvent(type, handler || defaultEventHandler, elem);
  }
};