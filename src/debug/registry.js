'use strict';

var _ = require('underscore');

var registry = {
  views: {},
  models: {},
  collections: {}
};

function bindDestroy(obj, collection) {
  if (typeof obj.destroy === 'function') {
    obj._destroy = obj.destroy;
    obj.destroy = _.bind(function() {
      registry[this.collection][this.obj.getDebugName()] = null;
      this.obj._destroy();
    }, {
      obj: obj,
      collection: collection
    });
  }
}

module.exports.registerView = function(view) {
  if (!view.parentView) {
    registry.views[view.getDebugName()] = view;
    bindDestroy(view, 'views');
  }
};

module.exports.registerModel = function(model) {
  registry.models[model.getDebugName()] = model;
  bindDestroy(model, 'models');
};

module.exports.registerCollection = function(collection) {
  registry.collections[collection.getDebugName()] = collection;
};

window.getRegistry = function() {
  console.log(registry);
};