/**
 * Module to bind events at the document level
 */
'use strict';

module.exports = function(el, eventName, selector, method, options, bindVirtualEvent) {
  if (eventName.substr(0, 4) === 'doc-') {
    var realEventName = eventName.substr(4);
    return bindVirtualEvent(document, realEventName, selector, method, options);
  }
};