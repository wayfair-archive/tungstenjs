/**
 * Module to map cross browser change events
 */
'use strict';

var document = require('global/document');
var eventsCore = require('../events_core');
var defaultEvents = require('./default_events');

/**
 * Check to see if this browser supports the onchange attribute
 * We use this check to handle change events for browsers that don't support capture phase events
 * Without capture, we need to listen for the bubbled event and change doesn't bubble
 *
 * @return {Boolean}   Whether it supports change
 */
var changeDoesNotBubble = (function() {
  // Taken from https://github.com/jquery/jquery/blob/10399ddcf8a239acc27bdec9231b996b178224d3/test/data/jquery-1.9.1.js#L1443
  // @license MIT
  var d = document.createElement('div');
  d.setAttribute('onchange', 't');
  return d.attributes.onchange && d.attributes.onchange.expando === true;
})();

/**
 * Gets the event name that should be listened on
 * Checkboxes and radio buttons trigger "propertychange" events while all others trigger "change"
 * @param  {Element} elem Element to listen to
 * @return {String}       Event name to use
 */
function getChangeEventName(elem) {
  if (elem.nodeName.toLowerCase() === 'input' && (elem.type === 'checkbox' || elem.type === 'radio')) {
    return 'onpropertychange';
  } else {
    return 'onchange';
  }
}

function trigger(evt) {
  eventsCore.triggerEvent(evt, 'change');
}

function addListener(e) {
  e.target.attachEvent(getChangeEventName(e.target), trigger);
}

function removeListener(e) {
  e.target.detachEvent(getChangeEventName(e.target), trigger);
}

/* global TUNGSTENJS_IS_TEST */
var TEST_MODE = typeof TUNGSTENJS_IS_TEST !== 'undefined' && TUNGSTENJS_IS_TEST;

module.exports = function(el, eventName, selector, method, options, bindVirtualEvent) {
  if (TEST_MODE ? module.exports.changeDoesNotBubble : changeDoesNotBubble && eventName === 'change') {
    return [
      defaultEvents(el, eventName, selector, method, options),
      bindVirtualEvent(el, 'focus', selector, addListener, options),
      bindVirtualEvent(el, 'blur', selector, removeListener, options)
    ];
  }
};
if (TEST_MODE) {
  // Exposing value so that it can be overridden for testing
  module.exports.changeDoesNotBubble = changeDoesNotBubble;
}
