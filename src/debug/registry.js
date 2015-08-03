'use strict';

var _ = require('underscore');
var eventBus = require('./event_bus');

var nestedRegistry = _.create(null);
var flatRegistry = _.create(null);

module.exports.register = function(view) {
  if (typeof view.destroy === 'function') {
    view._destroy = view.destroy;
    view.destroy = _.bind(function() {
      var name = this.getDebugName();
      nestedRegistry[name] = null;
      flatRegistry[name] = null;
      eventBus.trigger(eventBus.CHANGED_REGISTERED, nestedRegistry, flatRegistry);
      this._destroy();
    }, view);
  }
  var name = view.getDebugName();
  flatRegistry[name] = view;
  if (!view.parentView) {
    nestedRegistry[name] = view;
  }
  eventBus.trigger(eventBus.CHANGED_REGISTERED, nestedRegistry, flatRegistry);
};

module.exports.get = window.getRegistry = function(flat) {
  return flat ? flatRegistry : nestedRegistry;
};