'use strict';

var _ = require('underscore');
var logger = require('../utils/logger');

/**
 * Returns a passthrough function wrapping the passed in one
 *
 * @param  {Object}   obj              Class to override function for
 * @param  {string}   name             Name of the function to override
 * @param  {Object}   trackedFunctions Object that maps which functions are currently tracked
 *
 * @return {Function}                  Passthrough function
 */
function getTrackableFunction(obj, name, trackedFunctions) {
  var originalFn = obj[name];
  var debugName = obj.getDebugName();
  var fn = function tungstenTrackingPassthrough() {
    // Since objects are passed by reference, it can be updated without loosing reference
    if (trackedFunctions[name]) {
      logger.trace('Tracked function "' + debugName + '.' + name + '"', arguments);
    }
    // Apply using whatever context this function was called with
    return originalFn.apply(this, arguments);
  };
  fn.original = originalFn;
  return fn;
}

/**
 * Object to wrap Tungsten adaptor objects
 * Allows us to modify data without risk of overriding adaptor properties
 *
 * @param {Object} obj  Adaptor object to wrap
 * @param {string} type Type of wrapped object
 */
function RegistryWrapper(obj, type) {
  this.obj = obj;
  this.type = type;

  this.selected = false;
  this.collapsed = false;
  this.customEvents = [];

  this.debugName = obj.getDebugName();

  if (typeof obj.getFunctions === 'function') {
    this.trackedFunctions = {};
    this.objectFunctions = obj.getFunctions(this.trackedFunctions, getTrackableFunction);
  }

  if (typeof obj.getEvents === 'function') {
    this.objectEvents = obj.getEvents();
  }

  _.bindAll(this, 'isParent', 'getChildren');
}

/**
 * Null-safe passthrough function to base object's isParent function
 *
 * @return {Boolean} [description]
 */
RegistryWrapper.prototype.isParent = function() {
  return typeof this.obj.isParent === 'function' && this.obj.isParent();
};

/**
 * Toggles a named function's tracking state
 *
 * @param  {string} name Name of function to toggle state of
 */
RegistryWrapper.prototype.toggleFunctionTracking = function(name) {
  this.trackedFunctions[name] = !this.trackedFunctions[name];
};

/**
 * Gets the wrapped version of object's children
 *
 * @return {Array<RegistryWrapper>} Array of wrapped child objects
 */
RegistryWrapper.prototype.getChildren = function() {
  // Bail early if wrapped object doesn't have a getChildren function
  if (typeof this.obj.getChildren !== 'function') {
    return [];
  }
  var children =  this.obj.getChildren();
  var registry = RegistryWrapper.flatRegistry[this.type];
  var result = new Array(children.length);
  for (var i = 0; i < children.length; i++) {
    // We need the wrapped object, so we need to lookup from registry
    result[i] = registry[children[i].getDebugName()];
  }
  return result;
};

module.exports = RegistryWrapper;
