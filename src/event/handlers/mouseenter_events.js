/**
 * Module to handle the shimming in delegated mouseenter events
 */
'use strict';

/**
 * Fallback contains check from http://stackoverflow.com/a/6131052
 * @param  {Element} container Container element
 * @param  {Element} maybe     Element that may be within container
 * @return {Boolean}           Whether container contains maybe
 */
function contains(container, maybe) {
  // 16 is for a nodeType constant: window.Node.DOCUMENT_POSITION_CONTAINED_BY,
  // but the window.Node object is not available in IE8
  return container.contains ? container.contains(maybe) :
      !!(container.compareDocumentPosition(maybe) & 16);
}

/**
 * Mouseenter check from http://stackoverflow.com/a/6131052
 * Check if the given mouseover event constitutes a mouseenter event
 *
 * @param  {Object}  evt  Triggered event
 * @return {Boolean}      Whether evt constitutes a mouseenter event
 */
var mouseenterCheck = function(evt) {
  var elem = evt.currentTarget;
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
 * Check if the given mouseout event constitutes a mouseleave event
 *
 * @param  {Object}  evt  Triggered event
 * @return {Boolean}      Whether evt constitutes a mouseleave event
 */
var mouseleaveCheck = function(evt) {
  var elem = evt.currentTarget;
  var target = evt.target || evt.originalEvent.srcElement,
      related = evt.originalEvent.relatedTarget || evt.originalEvent.toElement;
  if ((elem === target || contains(elem, target)) &&
      !contains(elem, related)) {
          return true;
  }
  return false;
};

/**
 * Get the mouse enter handler
 * @param  {[type]} method [description]
 * @return {[type]}        [description]
 */
var getMouseEnterHandler = function(method) {
  return function (evt) {
    if (mouseenterCheck(evt)) {
      method(evt);
    }
  };
};

/**
 * Get the mouse leave handler
 * @param  {[type]} method [description]
 * @return {[type]}        [description]
 */
var getMouseLeaveHandler = function(method) {
  return function (evt) {
    if (mouseleaveCheck(evt)) {
      method(evt);
    }
  };
};

module.exports = function(el, eventName, selector, method, options, bindVirtualEvent) {
  if (eventName === 'mouseenter') {
    return bindVirtualEvent(el, 'mouseover', selector, getMouseEnterHandler(method), options);
  } else if (eventName === 'mouseleave') {
    return bindVirtualEvent(el, 'mouseout', selector, getMouseLeaveHandler(method), options);
  }
};