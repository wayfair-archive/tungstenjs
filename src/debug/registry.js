'use strict';

var _ = require('underscore');
var eventBus = require('./event_bus');
var logger = require('../utils/logger');

var nestedRegistry = _.create(null);
var flatRegistry = _.create(null);
nestedRegistry.views = {};
nestedRegistry.models = {};
flatRegistry.views = {};
flatRegistry.models = {};

function getTrackableFunction(obj, name, trackedFunctions) {
  var originalFn = obj[name];
  var debugName = obj.getDebugName();
  return function tungstenTrackingPassthrough() {
    if (trackedFunctions[name]) {
      logger.trace('Tracked function "' + debugName + '.' + name + '"', arguments);
    }
    return originalFn.apply(this, arguments);
  };
}

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

RegistryWrapper.prototype.isParent = function() {
  return this.obj.isParent();
};

RegistryWrapper.prototype.toggleFunctionTracking = function(name) {
  this.trackedFunctions[name] = !this.trackedFunctions[name];
};

RegistryWrapper.prototype.getChildren = function() {
  var children = this.obj.getChildren();
  var registry = flatRegistry[this.type];
  var result = new Array(children.length);
  for (var i = 0; i < children.length; i++) {
    result[i] = registry[children[i].getDebugName()];
  }
  return result;
};

function triggerChange() {
  eventBus.trigger(eventBus.CHANGED_REGISTERED, nestedRegistry, flatRegistry);
}

function updateNestedModels() {
  nestedRegistry.models = [];
  _.each(nestedRegistry.views, function(view) {
    var data = (view.obj.model || view.obj.collection);
    if (data) {
      nestedRegistry.models.push(flatRegistry.models[data.getDebugName()]);
    }
  });
}

function registerView(view) {
  var name = view.getDebugName();
  var wrapped = new RegistryWrapper(view, 'views');
  flatRegistry.views[name] = wrapped;
  if (!view.parentView) {
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

function registerModel(model) {
  var name = model.getDebugName();
  var wrapped = flatRegistry.models[name] = new RegistryWrapper(model, 'models');
  if (typeof model.destroy === 'function') {
    wrapped.destroy = _.bind(model.destroy, model);
    model.destroy = _.bind(function() {
      var name = this.obj.getDebugName();
      delete nestedRegistry.views[name];
      delete flatRegistry.views[name];
      updateNestedModels();
      triggerChange();
      this.destroy();
    }, wrapped);
  }
  triggerChange();
}

module.exports.register = function(obj) {
  if (obj) {
    if (obj.constructor && obj.constructor.tungstenView) {
      registerView(obj);
    } else if (obj.tungstenModel || obj.tungstenCollection) {
      registerModel(obj);
    }
  }
};

module.exports.get = window.getRegistry = function(flat) {
  return flat ? flatRegistry : nestedRegistry;
};