/**
 * Module to handle events that fire outside of the element
 */
'use strict';


/**
 * Track events firing on the element and document to determine if event is outside
 * @param  {Function} method handler to execute when event fires outside of the element
 * @return {object}          document and element handlers
 */
function getOutsideHandler(method) {
  var lastEventId = null;

  /**
   * If the event that is firing is not the same as the event that was fired on the element
   * execute the method
   * @param  {object} evt the event that's firing
   */
  var documentHandler = function(evt) {
    if (evt.eventId !== lastEventId) {
      method(evt);
    }
  };

  /**
   * Store the id of the event for comparison when documentHandler fires
   * @param  {object} evt the event firing on the element
   */
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

    var handlers = getOutsideHandler(method);
    return [
      bindVirtualEvent(el, realEventName, selector, handlers.elementHandler, options),
      bindVirtualEvent(document, realEventName, 'self', handlers.documentHandler, options)
    ];
  }
};