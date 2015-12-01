/**
 * Adaptor specific code for context lookups
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */

'use strict';

var _ = require('underscore');
var Context = require('../../src/template/template_context');

// Use prototypeless objects to avoid unnecessary conflicts
var blockedModelProperties = _.create(null);
var blockedCollectionProperties = _.create(null);

// Add properties that aren't on the prototype, but shouldn't be accessed anyways
blockedModelProperties.attributes = true;
blockedCollectionProperties.models = true;

// @Todo expand list to cover prototype keys as on the Backbone adaptor

/**
 * Set up parent context if the model has parents
 * @param  {Any}      view           Value to wrap in context
 * @param  {Context?} parentContext  parentContext to use for lookups
 */
var initialize = function(view, parentContext) {
  if (view == null) {
    view = {};
  }
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
  if (view[name] != null) {
    if (view.tungstenCollection && blockedCollectionProperties[name]) {
      return null;
    }
    if (view.tungstenModel && blockedModelProperties[name]) {
      return null;
    }
    value = view[name];
  }

  return value;
};

module.exports = {
  initialize: initialize,
  lookupValue: lookupValue
};
