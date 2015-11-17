/**
 * Adaptor specific code for context lookups
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */

'use strict';

var _ = require('underscore');
var Context = require('../../src/template/template_context');
var Backbone = require('backbone');

// List of properties that are allowed to be accessed from template
var allowedModelProperties = _.invert(['validationError']);
var allowedCollectionProperties = _.invert([]);

// Use prototypeless objects to avoid unnecessary conflicts
var blockedModelProperties = _.create(null);
var blockedCollectionProperties = _.create(null);

// Add properties that aren't on the prototype, but shouldn't be accessed anyways
blockedModelProperties.attributes = true;
blockedCollectionProperties.models = true;

_.each(Backbone.Model.prototype, function(val, key) {
  if (allowedModelProperties[key] == null) {
    blockedModelProperties[key] = true;
  }
});
_.each(Backbone.Collection.prototype, function(val, key) {
  if (allowedCollectionProperties[key] == null) {
    blockedCollectionProperties[key] = true;
  }
});

/**
 * Set up parent context if the model has parents
 * @param  {Any}      view           Value to wrap in context
 * @param  {Context?} parentContext  parentContext to use for lookups
 */
var initialize = function(view, parentContext) {
  if (view == null) {
    view = {};
  }
  if (!parentContext && (view.parent || view.collection)) {
    this.parent = new Context(view.parent || view.collection);
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
  if (this.isModel(view) && view.has(name)) {
    value = view.get(name);
  } else if (view[name] != null) {
    if (view.tungstenCollection && blockedCollectionProperties[name]) {
      return null;
    }
    if (view.tungstenModel && blockedModelProperties[name]) {
      return null;
    }
    value = view[name];
  }

  if (typeof value === 'function') {
    value = value.call(view);
  }
  return value;
};

module.exports = {
  initialize: initialize,
  lookupValue: lookupValue,
  ComponentWidget: require('./component_widget')
};
