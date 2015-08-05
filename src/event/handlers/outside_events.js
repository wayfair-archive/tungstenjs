'use strict';

function getOutsideHandler(method) {
  var lastEventId = null;

  var documentHandler = function(evt) {
    if (evt.eventId !== lastEventId) {
      method(evt);
    }
  };

  var elementHandler = function(evt) {
    lastEventId = evt.eventId;
  };

  return {
    documentHandler: documentHandler,
    elementHandler: elementHandler
  };
}

module.exports = function(el, eventName, selector, method, options, bindVirtualEvent) {
  if (eventName.substr(-8) === '-outside') {
    var realEventName = eventName.substr(0, eventName.length - 8);

    var handlers = getOutsideHandler(method, options);
    return [
      bindVirtualEvent(el, realEventName, selector, handlers.elementHandler, options),
      bindVirtualEvent(document, realEventName, 'self', handlers.documentHandler, options)
    ];
  }
};