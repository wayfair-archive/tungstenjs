'use strict';

var _ = require('underscore');
var eventBus = require('./event_bus');

var registry = _.create(null);

module.exports.register = function(view) {
  if (!view.parentView) {
    registry[view.getDebugName()] = view;
    eventBus.trigger(eventBus.CHANGED_REGISTERED, registry);
    if (typeof view.destroy === 'function') {
      view._destroy = view.destroy;
      view.destroy = _.bind(function() {
        eventBus.stopListeningTo(this);
        registry[this.getDebugName()] = null;
        eventBus.trigger(eventBus.CHANGED_REGISTERED, registry);
        this._destroy();
      }, view);
    }
  }
};

module.exports.get = window.getRegistry = function() {
  return registry;
};