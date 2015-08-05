/**
 * Module to map cross browser blur and focus events
 */
'use strict';

/**
 * Check to see if this browser supports the onfocusin attribute
 * We use this check to rebind blur/focus for browsers that don't support capture phase events
 * Without capture, we need to listen for the bubbled event and blur/focus don't bubble
 *
 * @return {Boolean}   Whether it supports focusin
 */
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
  'blur': 'focusout',
  'focus': 'focusin'
};

module.exports = function(el, eventName, selector, method, options, bindVirtualEvent) {
  if (nativeFocusin && eventNameMap[eventName]) {
    // Rename the event and pass through to the default handler
    return bindVirtualEvent(el, eventNameMap[eventName], selector, method, options);
  }
};