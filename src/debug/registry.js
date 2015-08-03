'use strict';

var _ = require('underscore');
var eventBus = require('./event_bus');

var nestedRegistry = _.create(null);
var flatRegistry = _.create(null);
nestedRegistry.views = {};
nestedRegistry.models = {};
flatRegistry.views = {};
flatRegistry.models = {};

function triggerChange() {
  eventBus.trigger(eventBus.CHANGED_REGISTERED, nestedRegistry, flatRegistry);
}

function updateNestedModels() {
  nestedRegistry.models = _.map(nestedRegistry.views, function(view) {
    return view.model || view.collection;
  });
}

function registerView(view) {
  if (typeof view.destroy === 'function') {
    view._destroy = view.destroy;
    view.destroy = _.bind(function() {
      var name = this.getDebugName();
      delete nestedRegistry.views[name];
      delete flatRegistry.views[name];
      updateNestedModels();
      triggerChange();
      this._destroy();
    }, view);
  }
  var name = view.getDebugName();
  flatRegistry.views[name] = view;
  if (!view.parentView) {
    nestedRegistry.views[name] = view;
  }
  updateNestedModels();
  triggerChange();
}

function registerModel(model) {
  if (typeof model.destroy === 'function') {
    model._destroy = model.destroy;
    model.destroy = _.bind(function() {
      var name = this.getDebugName();
      delete flatRegistry.models[name];
      updateNestedModels();
      triggerChange();
      this._destroy();
    }, model);
  }
  var name = model.getDebugName();
  flatRegistry.models[name] = model;
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