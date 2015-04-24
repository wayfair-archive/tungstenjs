/**
 * Adaptor specific code for context lookups
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */

'use strict';

var Context = require('../../src/template/template_context');

/**
 * Set up parent context if the model has parents
 * @param  {Any}      view           Value to wrap in context
 * @param  {Context?} parentContext  parentContext to use for lookups
 */
var initialize = function(view, parentContext) {
  if (!parentContext && (view.collection || view.parent)) {
    this.parent = new Context(view.collection || view.parent);
  } else {
    this.parent = parentContext;
  }
};

/**
 * Lookup value from given context view
 * @param  {Object} view Context to lookup values from
 * @param  {String} name String value to check
 * @return {Any?}        Value from view or null
 */
var lookupValue = function(view, name) {
  var value = null;
  if (view[name]) {
    value = view[name];
  } else if (this.isModel(view)) {
    value = view.get(name);
  }

  if (typeof value === 'function') {
    value = value.call(view);
  }
  return value;
};

module.exports = {
  initialize: initialize,
  lookupValue: lookupValue
};