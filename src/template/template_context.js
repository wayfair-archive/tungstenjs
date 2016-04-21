/**
 * Context to wrap Tungsten Models and Collections transparently
 * This allows us to know what bit of a model is currently being referenced while rendering template
 *
 * Originally based on https://github.com/janl/mustache.js/blob/master/mustache.js#L336
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
'use strict';

var _ = require('underscore');
var logger = require('../utils/logger');

/** @type {Object} storage to prevent repeated warnings about the same computed property */
var computedPropertyWarnings = {};

/**
 * Represents a rendering context by wrapping a view object and
 * maintaining a reference to the parent context.
 */
function Context(view, parentContext) {
  this.view = view || {};
  this.cache = {
    '.': this.view
  };
  this.parent = parentContext;

  // If parent context isn't passed, but the model has parents, build the chain
  this.initialize(view, parentContext);
  if (this.isModel(view)) {
    this.lastModel = view;
  } else if (parentContext) {
    this.lastModel = parentContext.lastModel;
  }
}

/**
 * Default initialize function
 */
Context.prototype.initialize = function() {};

/**
 * Default lookup function to clearly indicate that it wasn't set
 */
Context.prototype.lookupValue = function() {
  throw 'Lookup function not set.';
};

Context.ComponentWidget = function() {
  throw 'ComponentWidget not set';
};

/** @type {Object} Container for registered lambda functions */
var lambdas = {};

/**
 * Public function to register lambdas without overriding lookupValue
 * Allows for global lambdas to be caught in first lookup rather than
 * going upstream until hitting the top level scope
 *
 * @param  {String}   name Mustache key to intercept
 * @param  {Function} fn   Lambda function to run
 */
Context.registerLambda = function(name, fn) {
  if (typeof name !== 'string' || typeof fn !== 'function' || fn.length < 1) {
    throw 'Invalid arguments passed for registerLambda';
  }
  lambdas[name] = fn;
};

/**
 * Internal lookup function to intercept interesting lookups
 */
Context.prototype._lookupValue = function(view, name) {
  if (lambdas[name] && typeof lambdas[name] === 'function' && lambdas.hasOwnProperty(name)) {
    return lambdas[name];
  }
  return this.lookupValue(view, name);
};

/**
 * Checks if the given object is a Tungsten Model
 * @param  {Any}     object The object to check
 * @return {Boolean}        Whether the given object is a Tungsten Model
 */
Context.prototype.isModel = function(object) {
  return object && (object.tungstenModel || object.isComponent);
};

if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
/**
 * Debug Helpers for determining context
 */
  var debugHelpers = {
    context: function() {
      if (arguments.length) {
        logger.log('W/CONTEXT:', this, arguments);
      } else {
        logger.log('W/CONTEXT:', this);
      }
    },
    lastModel: function() {
      logger.log('W/LASTMODEL:', this.lastModel);
    },
    lastModelForDebugger: function() {
      return this.lastModel;
    },
    debug: function() {
      var self = this;
      for (var i = 0; i < arguments.length; i++) {
        logger.log('W/DEBUG:', arguments[i], '=>', self.lookup(arguments[i]));
      }
    }
  };
}

/**
 * Creates a new context using the given view with this context
 * as the parent.
 */
Context.prototype.push = function(view) {
  return new Context(view, this);
};

/**
 * Creates a new context using the given view with this context
 * as the parent.
 */
Context.prototype.partial = function() {
  return new Context(this.view);
};

/**
 * Returns the value of the given name in this context, traversing
 * up the context hierarchy if the value is absent in this context's view.
 */
Context.prototype.lookup = function(name, handleLambda) {
  // Sometimes comment blocks get registered as interpolators
  // Just return empty string and nothing will render anyways
  if (name.substr(0, 1) === '!') {
    if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
      var debugName = name.substr(1).split('/');
      if (debugName[0] === 'w' && debugHelpers[debugName[1]]) {
        var fn = debugHelpers[debugName[1]];
        debugName = debugName.slice(2);
        return fn.apply(this, debugName);
      }
    }
    return null;
  }

  // Safety precaution
  if (typeof name !== 'string') {
    name = '';
  }

  var cache = this.cache;

  var value;
  if (name in cache) {
    value = cache[name];
  } else {
    var context = this;
    var names, index, fnContext;

    while (context) {
      // If this is a nested lookup, upward lookups can't occur mid-lookup
      if (name.indexOf('.') > 0) {
        value = context.view;
        names = name.split('.');
        index = 0;

        while (value != null && index < names.length) {
          fnContext = value;
          value = this._lookupValue(value, names[index]);
          index += 1;
          if (typeof value === 'function' && index < names.length) {
            value = value.call(fnContext);
          }
        }
      } else {
        fnContext = context.view;
        // if it isn't a nested lookup, just grab it
        value = this._lookupValue(context.view, name);
      }

      // If a value was found, break out
      if (value != null) {
        // When invoking handleLambda return immediately to avoid caching
        if (handleLambda && value && value.type === 'Widget') {
          handleLambda(value, fnContext);
          return;
        }
        if (typeof value === 'function') {
          // Check that the found function takes in at least one argument
          // Used to avoid conflicts with computed properties until those can be deprecated
          var arity = value.length;
          if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
          // Trackable functions can be wrapped, so check orignal's arity
            if (value.original) {
              arity = value.original.length;
            }
          }
          if (handleLambda && arity >= 1) {
            handleLambda(value, fnContext);
            return;
          } else {
            if (computedPropertyWarnings[name] !== true) {
              computedPropertyWarnings[name] = true;
              logger.warn('Computed properties are now deprecated and will be removed soon. Please change "' + name + '" to a derived property');
            }
            value = value.call(fnContext);
          }
        }

        break;
      }

      // Otherwise go up a scope and re-check
      context = context.parent;
    }

    cache[name] = value;
  }

  return value;
};

/**
 * Check if object is an Array or Backbone Collection
 * @param  {Any}     object Any value referenced by a mustache section
 * @return {Boolean}        If the value is an Array or Collection
 */
Context.isArray = Context.prototype.isArray = function(object) {
  return _.isArray(object) || object && object.tungstenCollection;
};

/**
 * Creates an object with often used checks for values
 * @param  {Any}    value Value from the template data
 * @return {Object}       Parsed value with convenience helpers
 */
Context.parseValue = function(value) {
  var valueIsArray = Context.isArray(value);
  var valueIsTruthy = valueIsArray ? value.length !== 0 : !!value;
  return {
    value: valueIsArray && value.models ? value.models : value,
    isArray: valueIsArray,
    isTruthy: valueIsTruthy
  };
};

/**
 * Sets lookup
 * @param {Object} adaptor Adaptor functions to set
 */
Context.setAdapterFunctions = function(adaptor) {
  if (!adaptor) {
    return;
  }
  if (typeof adaptor.initialize === 'function') {
    Context.prototype.initialize = adaptor.initialize;
  }
  if (typeof adaptor.lookupValue === 'function') {
    Context.prototype.lookupValue = adaptor.lookupValue;
  }
  if (typeof adaptor.ComponentWidget === 'function') {
    Context.ComponentWidget = adaptor.ComponentWidget;
  }
};

module.exports = Context;
