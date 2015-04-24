/**
 * Utility class to non-directly bind events
 */
'use strict';
var _ = require('underscore');
var dataset = require('data-set');
var ObjectPool = require('./../utils/object_pool');
// Require touch events to attach handlers
require('./touch_events');

/**
 * Wrapper to add event listener
 * @param {String}   eventName Name of event to attach
 * @param {Function} handler   Function to bind
 * @param {Element}  elem      Element to bind to
 */
function addEventListener(eventName, handler, elem) {
  if (elem.addEventListener) {
    // Setting useCapture to true so that this virtual handler is always fired first
    // Also handles events that don't bubble correctly like focus/blur
    elem.addEventListener(eventName, handler, true);
  } else {
    elem.attachEvent('on' + eventName, handler);
  }
}

/**
 * Fallback contains check from http://stackoverflow.com/a/6131052
 * @param  {Element} container Container element
 * @param  {Element} maybe     Element that may be within container
 * @return {Boolean}           Whether container contains maybe
 */
function contains(container, maybe) {
  return container.contains ? container.contains(maybe) :
      !!(container.compareDocumentPosition(maybe) & 16);
}

/**
 * Mouseenter check from http://stackoverflow.com/a/6131052
 * @param  {Object}  evt  Triggered event
 * @param  {Element} elem Element to check against
 * @return {Boolean}      Whether evt constitutes a mouseenter event
 */
var mouseenterCheck = function(evt, elem) {
  var target = evt.target || evt.originalEvent.srcElement,
      related = evt.originalEvent.relatedTarget || evt.originalEvent.fromElement;
  if ((elem === target || contains(elem, target)) &&
      !contains(elem, related)) {
          return true;
  }
  return false;
};

/**
 * Mouseleave check from http://stackoverflow.com/a/6131052
 * @param  {Object}  evt  Triggered event
 * @param  {Element} elem Element to check against
 * @return {Boolean}      Whether evt constitutes a mouseleave event
 */
var mouseleaveCheck = function(evt, elem) {
  var target = evt.target || evt.originalEvent.srcElement,
      related = evt.originalEvent.relatedTarget || evt.originalEvent.toElement;
  if ((elem === target || contains(elem, target)) &&
      !contains(elem, related)) {
          return true;
  }
  return false;
};

/**
 * Returns the event object bound for the given element
 * @param  {Element} elem  DOM node to get events object for
 * @return {Object}        Event object bound to the element
 */
var getEvents = function(elem) {
  var data = dataset(elem);
  return data.events || {};
};

/**
 * Binds the given event object to the given element
 * @param {Element} elem    DOM node to set events object for
 * @param {Object}  events  Event object to bind to the element
 */
var setEvents = function(elem, events) {
  var data = dataset(elem);
  data.events = events;
};

/**
 * Check if this event name should be bound to the window
 * @param  {String}  eventName  Event name
 * @return {Boolean}            Whether the event name should be bound to the window
 */
var isWindowEvent = function(eventName) {
  return eventName.substr(0, 4) === 'win-';
};

/**
 * Check if this event name should be bound to the document
 * @param  {String}  eventName  Event name
 * @return {Boolean}            Whether the event name should be bound to the document
 */
var isDocumentEvent = function(eventName) {
  return eventName.substr(0, 4) === 'doc-';
};

/**
 * Wrapper function for the event object
 * @param {Object} evt  Native event to wrap
 */
function WEvent(evt) {
  if (evt) {
    this.originalEvent = evt;
    this.type = evt.type;
    this.which = evt.which;
    this.button = evt.button;
    this.currentTarget = evt.currentTarget;
    this.delegateTarget = null;
    this.target = evt.target || evt.srcElement;
    this.shiftKey = evt.shiftKey;
    this.altKey = evt.altKey;
    this.ctrlKey = evt.ctrlKey;
    this.metaKey = evt.metaKey;
  }
  this.propagationStopped = false;
  this.immediatePropagationStopped = false;
}
// Map through preventDefault and fill for IE
WEvent.prototype.preventDefault = function() {
  if (this.originalEvent.preventDefault) {
    this.originalEvent.preventDefault();
  } else {
    this.originalEvent.returnValue = false;
  }
};

// Propagation functions should only affect the virtual event, so don't call anything on the original event
WEvent.prototype.stopPropagation = function() {
  this.propagationStopped = true;
};
WEvent.prototype.stopImmediatePropagation = function() {
  this.immediatePropagationStopped = true;
  this.propagationStopped = true;
};
WEvent.prototype.isPropagationStopped = function() {
  return this.propagationStopped;
};
WEvent.prototype.isImmediatePropagationStopped = function() {
  return this.immediatePropagationStopped;
};

// Create object pool for events
var eventPool = new ObjectPool(20, WEvent);
eventPool.preallocate(5);


/**
 * Returns an array of the js- classes on this element
 * @param  {Element}       element DomNode to parse
 * @return {Array<String>}         Array of the js- classes
 */
var getActiveClasses = function(element) {
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
 * Returns a formatted list of events that are "bound" for this element
 * @param  {Element} element Element to find events for
 * @return {Object}          Formatted list of events for the element
 */
var getEventsForElement = function(element) {
  var path = getActiveClasses(element);
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
    events = getEvents(elem);
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
 * Function to bind / run for bindings that are set to or return false
 * @param  {Event} evt Event to run against
 */
var falseHandler = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();
};

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
  var events = getEvents(window);
  // Window has a narrow scope of bindability
  var eventsToTrigger = events[nativeEvent.type].self;
  var evt = eventPool.allocate(nativeEvent);
  if (evt.type === 'scroll') {
    evt.previous = previousWindowData.scroll;
    evt.current = getScrollData(window);
    previousWindowData.scroll = evt.current;
  }
  for (var i = 0; i < eventsToTrigger.length; i++) {
    eventsToTrigger[i].method(evt);
  }
};

/**
 * Function bound to all global level events
 */
var eventHandler = function(nativeEvent) {
  var evt = eventPool.allocate(nativeEvent);
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
   * @param  {Function?} validateFunction  Optional function to run before firing event
   */
  var checkEvents = function(typeEvents, validateFunction) {
    var elemClasses, elemClass;

    // Iterate over previously passed elements to check for any delegated events
    for (var i = 0; i < activePath.length; i++) {
      elemClasses = activePath[i].classes;
      // Once stopPropagation is called stop
      if (!evt.isPropagationStopped()) {
        for (var j = 0; j < elemClasses.length; j++) {
          elemClass = elemClasses[j];
          if (typeEvents[elemClass] && (!validateFunction || validateFunction(evt, activePath[i].element))) {
            triggerEventFunctions(activePath[i].element, typeEvents[elemClass], elemClass, elem);
          }
        }
      }
    }

    // Check for any non-delegated events
    if (!evt.isPropagationStopped() && typeEvents.self && (!validateFunction || validateFunction(evt, elem))) {
      triggerEventFunctions(elem, typeEvents.self);
    }
  };

  while (elem && !evt.isPropagationStopped()) {
    events = getEvents(elem);
    if (events) {
      // Generic events
      if (events[evt.type]) {
        checkEvents(events[evt.type]);
      }
      // 'mouseenter' and 'mouseleave' are special cases
      if (evt.type === 'mouseover' && events.mouseenter) {
        checkEvents(events.mouseenter, mouseenterCheck);
      }
      if (evt.type === 'mouseout' && events.mouseleave) {
        checkEvents(events.mouseleave, mouseleaveCheck);
      }
    }
    // Create array of class names that match our pattern to check for delegation later
    var elemActiveClasses = getActiveClasses(elem);
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
 * Hash to track events that are already globally bound
 * @type {Object}
 */
var boundEvents = {};

/**
 * Hash to change what event is actually bound
 * Event still references the key, but uses the value under the hood
 * @type {Object}
 */
var bindMap = {
  'mouseenter': 'mouseover',
  'mouseleave': 'mouseout'
};

var nativeFocusin = (function() {
  // Taken from https://github.com/jquery/jquery/blob/10399ddcf8a239acc27bdec9231b996b178224d3/test/data/jquery-1.9.1.js#L1443
  var d = document.createElement('div');
  d.setAttribute('onfocusin', 't');
  return d.attributes.onfocusin.expando === false;
})();

/**
 * Hash to change what event is actually bound
 * Event name is swapped transparently
 * @type {Object}
 */
var eventNameMap = {
  'blur': nativeFocusin ? 'focusout' : 'blur',
  'focus': nativeFocusin ? 'focusin' : 'focus'
};

/**
 * Adds a global binding for requested event types that aren't already bound
 * @param  {String} type  Event name to bind
 */
var bindEventTypes = function(type) {
  // Ensure only one binding per eventName is set
  if (!boundEvents[type]) {
    boundEvents[type] = true;

    var elem = document;
    var handler = eventHandler;
    if (isDocumentEvent(type)) {
      type = type.substr(4);
    } else if (isWindowEvent(type)) {
      elem = window;
      type = type.substr(4);
      handler = windowEventHandler;
    }

    type = bindMap[type] || type;
    addEventListener(type, handler, elem);
  }
};

/**
 * Validates the given selector as a valid js- class
 * Throws an exception if not
 * @param  {String} selector Selector to validate
 */
var validateSelector = function(selector) {
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
 * Adds a new event binding
 * @param  {Element}  el        Element to bind to
 * @param  {String}   eventName Event name to bind
 * @param  {String}   selector  Child class if the event is delegated
 * @param  {Function} method    Function to execute
 */
var bindVirtualEvent = function(el, eventName, selector, method) {
  // Swap out eventName if needed
  eventName = eventNameMap[eventName] || eventName;

  // if method is false, set it to falseHandler
  // Convenience wrapper for stopPropagation() and preventDefault()
  if (method === false) {
    method = falseHandler;
  }
  // if method is not a function, throw an error
  if (typeof method !== 'function') {
    throw 'Attempting to bind non-function to ' + eventName + ' ' + selector;
  }

  // Add global binding for the event type
  bindEventTypes(eventName);
  // Default to 'self' selector
  selector = !selector ? 'self' : selector.substr(1);

  // Document and window binding need some things adjusted
  if (isDocumentEvent(eventName)) {
    el = document;
    eventName = eventName.substr(4);
    selector = 'self';
  } else if (isWindowEvent(eventName)) {
    el = window;
    eventName = eventName.substr(4);
    selector = 'self';
  }

  // Add this binding to the event object for the element
  var eventMap = getEvents(el, 'events');
  var events = eventMap[eventName] = eventMap[eventName] || {};
  var selectorEvents = events[selector] = events[selector] || [];
  selectorEvents.push({
    method: method
  });

  setEvents(el, eventMap);

  // Returns arguments to call unbind with
  return [el, eventName, selector, method];
};

/**
 * Remove bound events
 * @param  {Element}  el        Element to unbind from
 * @param  {String}   eventName Optional: Event name to unbind
 * @param  {String}   selector  Optional: Child class or '**' to unbind delegated events
 * @param  {Function} method    Optional: Specific function to unbind
 */
var unbindVirtualEvent = function(el, eventName, selector, method) {
  var eventMap = getEvents(el);

  // Iterate over delegated event types
  _.each(eventMap, function(selectors, boundEventName) {
    // If eventName was passed in, filter
    if (eventName !== '' && boundEventName !== eventName) {
      return;
    }
    // Iterate over delegated selectors
    _.each(selectors, function(boundMethods, boundSelector) {
      // If selector was passed in, filter
      if (selector !== '' && selector !== boundSelector) {
        return;
      }
      var boundMethod;
      for (var i = boundMethods.length; i--;) {
        boundMethod = boundMethods[i];
        // If a specific method was passed in, filter
        if (boundMethod.method !== method) {
          continue;
        }
        // If we got down here, remove the event
        boundMethods.splice(i, 1);
      }
    });
  });

  setEvents(el, eventMap);
};

module.exports = {
  getEventsForElement: getEventsForElement,
  bindEventTypes: bindEventTypes,
  validateSelector: validateSelector,
  bindVirtualEvent: bindVirtualEvent,
  unbindVirtualEvent: unbindVirtualEvent
};
