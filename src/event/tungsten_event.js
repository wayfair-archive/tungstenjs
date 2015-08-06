'use strict';

var _ = require('underscore');
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
  this.eventId = _.uniqueId('e');
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

var ObjectPool = require('./../utils/object_pool');

// Create object pool for events
var eventPool = new ObjectPool(20, WEvent);
eventPool.preallocate(5);

module.exports = function(nativeEvent) {
  return eventPool.allocate(nativeEvent);
};