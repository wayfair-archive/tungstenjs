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
var isArray = require('../utils/is_array');
var IS_DEV = require('../tungsten.js').IS_DEV;

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

Context.SUBVIEW_KEY = 'nested_content';

Context.ComponentWidget = function() {
  throw 'ComponentWidget not set';
};

/**
 * Internal lookup function to intercept interesting lookups
 */
Context.prototype._lookupValue = function(view, name, stack) {
  if (stack && name === Context.SUBVIEW_KEY) {
    if (view.is_subview) {
      if (view.template && typeof view.template._render === 'function') {
        return view.template._render(null, view.data, null, null, stack);
      }
    }
    if (view.is_tungsten_component) {
      if (!view.instance) {
        view.template = view.template.wrap(view.tag_name || 'span');
        view.model = new view.model(view.data || {});
        view.instance = new Context.ComponentWidget(view.view, view.model, view.template);
      }
      return stack.createObject(view.instance);
    }
  }
  return this.lookupValue(view, name);
};

/**
 * Checks if the given object is a Tungsten Model
 * @param  {Any}     object The object to check
 * @return {Boolean}        Whether the given object is a Tungsten Model
 */
Context.prototype.isModel = function(object) {
  return object && object.tungstenModel;
};

/**
 * Debug Helpers for determining context
 */
var debugHelpers = {
  context: function() {
    if (arguments.length) {
      window.console.log('W/CONTEXT:', this, arguments);
    } else {
      window.console.log('W/CONTEXT:', this);
    }
  },
  lastModel: function() {
    window.console.log('W/LASTMODEL:', this.lastModel);
  },
  debug: function() {
    var self = this;
    for (var i = 0; i < arguments.length; i++) {
      window.console.log('W/DEBUG:', arguments[i], '=>', self.lookup(arguments[i]));
    }
  }
};

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
Context.prototype.lookup = function(name, stack) {
  // Sometimes comment blocks get registered as interpolators
  // Just return empty string and nothing will render anyways
  if (name.substr(0, 1) === '!') {
    if (IS_DEV) {
      var debugName = name.substr(1).split('/');
      if (debugName[0] === 'w' && debugHelpers[debugName[1]]) {
        var fn = debugHelpers[debugName[1]];
        debugName = debugName.slice(2);
        fn.apply(this, debugName);
      }
    }
    return null;
  }

  // Sometimes comment blocks get registered as interpolators
  if (name.substr(0, 1) === '!') {
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
    var names, index;

    while (context) {
      // If this is a nested lookup, upward lookups can't occur mid-lookup
      if (name.indexOf('.') > 0) {
        value = context.view;
        names = name.split('.');
        index = 0;

        while (value != null && index < names.length) {
          value = this._lookupValue(value, names[index], stack);
          index += 1;
        }
      } else {
        // if it isn't a nested lookup, just grab it
        value = this._lookupValue(context.view, name, stack);
      }

      // If a value was found, break out
      if (value != null) {
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
Context.isArray = function(object) {
  return isArray(object) || object && object.tungstenCollection;
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
 * Takes a template with a string or template key and parses it
 * @param  {Object} template template object to parse
 * @return {String}          String key to get from context
 */
Context.getInterpolatorKey = function(template) {
  var key = '';
  if (template.x) {
    key = template.x.s;
    var values = template.x.r;
    for (var i = values.length; i--;) {
      key = key.replace('_' + i, values[i]);
    }
  } else if (template.r) {
    key = template.r;
  }
  return key;
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
