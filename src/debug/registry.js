'use strict';

import _ from 'underscore';
import eventBus from './event_bus';

var nestedRegistry = _.create(null);
var flatRegistry = _.create(null);
nestedRegistry.views = {};
nestedRegistry.models = {};
flatRegistry.views = {};
flatRegistry.models = {};

import RegistryWrapper from './registry_wrapper';
RegistryWrapper.flatRegistry = flatRegistry;

/**
 * Shortcut to trigger a popout panel re-render
 */
function triggerChange() {
  eventBus.trigger(eventBus.CHANGED_REGISTERED, nestedRegistry, flatRegistry);
}

/**
 * Updates nestedRegistry.models using the top level view's models to get nesting
 */
function updateNestedModels() {
  nestedRegistry.models = [];
  _.each(nestedRegistry.views, function(view) {
    var data = (view.obj.model || view.obj.collection);
    if (data) {
      nestedRegistry.models.push(flatRegistry.models[data.getDebugName()]);
    }
  });
}

/**
 * Adds a View to the registry
 *
 * @param  {Object} view View to register
 */
function registerView(view) {
  var name = view.getDebugName();
  var wrapped = new RegistryWrapper(view, 'views');
  flatRegistry.views[name] = wrapped;
  if (!view.parentView && !view.isComponentView) {
    nestedRegistry.views[name] = wrapped;
  }
  if (typeof view.destroy === 'function') {
    wrapped.destroy = _.bind(view.destroy, view);
    view.destroy = _.bind(function() {
      var name = this.obj.getDebugName();
      delete nestedRegistry.views[name];
      delete flatRegistry.views[name];
      updateNestedModels();
      triggerChange();
      this.destroy();
    }, wrapped);
  }
  updateNestedModels();
  triggerChange();
}

/**
 * Adds a Model to the registry
 *
 * @param  {Object} model Model to register
 */
function registerModel(model) {
  var name = model.getDebugName();
  var wrapped = flatRegistry.models[name] = new RegistryWrapper(model, 'models');
  if (typeof model.destroy === 'function') {
    wrapped.destroy = _.bind(model.destroy, model);
    model.destroy = _.bind(function() {
      var name = this.obj.getDebugName();
      delete flatRegistry.models[name];
      updateNestedModels();
      triggerChange();
      this.destroy();
    }, wrapped);
  }
  triggerChange();
}

/**
 * Public register function that sorts objects by detected type
 *
 * @param  {Object} obj Object to attempt to register
 */
module.exports.register = function(obj) {
  if (obj) {
    if (obj.constructor && obj.constructor.tungstenView) {
      registerView(obj);
    } else if (obj.tungstenModel || obj.tungstenCollection) {
      registerModel(obj);
    }
  }
};

/**
 * Returns registered objects
 *
 * @param  {Boolean} flat Whether to return flat or nested registry
 *
 * @return {Object}       Selected registry
 */
module.exports.get = window.getRegistry = function(flat) {
  return flat ? flatRegistry : nestedRegistry;
};
