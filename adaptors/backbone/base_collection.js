/**
 * Base Collection - Provides generic reusable methods that child collections can inherit from
 */

'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var backboneNested = require('./backbone_nested');
var tungsten = require('../../src/tungsten');
var logger = require('../../src/utils/logger');

var ComponentWidget = require('./component_widget');

/**
 * BaseCollection
 *
 * @constructor
 * @class BaseCollection
 */
var BaseCollection = Backbone.Collection.extend({
  tungstenCollection: true,
  initialize: function() {
    /* develblock:start */
    this.initDebug();
    /* develblock:end */
    this.postInitialize();
  },

  bindExposedEvent: function(event, childComponent) {
    this.listenTo(childComponent.model, event, function() {
      var args = Array.prototype.slice.call(arguments);
      this.trigger.apply(this, [event].concat(args));
      if (event.substr(0, 7) === 'change:') {
        this.trigger('change', this);
      }
    });
  },

  /**
   * Method for checking whether an object should be considered a model for
   * the purposes of adding to the collection.
   *
   * Overriding to allow ComponentWidgets to be treated as models
   *
   * @param  {Object}  model Model to check
   * @return {Boolean}
   */
  _isModel: function(model) {
    return Backbone.Collection.prototype._isModel(model) || model instanceof ComponentWidget;
  },

  /**
   * Binds events when a model is added to a collection
   *
   * @param {Object} model
   * @param {Object} options
   */
  _addReference: function(model, options) {
    Backbone.Collection.prototype._addReference.call(this, model, options);
    if (ComponentWidget.isComponent(model) && model.exposedEvents) {
      var events = model.exposedEvents;
      if (events === true) {
        model.model.on('all', this._onModelEvent, this);
      } else if (events.length) {
        for (var i = 0; i < events.length; i++) {
          this.bindExposedEvent(events[i], model);
        }
      }
    }
  },

  /**
   * Unbinds events when a model is removed from a collection
   *
   * @param {Object} model
   * @param {Object} options
   */
  _removeReference: function(model, options) {
    if (ComponentWidget.isComponent(model) && model.model && model.exposedEvents) {
      var events = model.exposedEvents;
      if (events === true) {
        model.model.off('all', this._onModelEvent, this);
      } else if (events.length) {
        for (var i = 0; i < events.length; i++) {
          this.stopListening(model.model, events[i]);
        }
      }
    }
    Backbone.Collection.prototype._removeReference.call(this, model, options);
  },

  /* develblock:start */

  /**
   * Bootstraps all debug functionality
   */
  initDebug: function() {
    tungsten.debug.registry.register(this);
    _.bindAll(this, 'getDebugName', 'getChildren');
  },

  /**
   * Debug name of this object, using declared debugName, falling back to cid
   *
   * @return {string} Debug name
   */
  getDebugName: function() {
    if (!this.cid) {
      this.cid = _.uniqueId('collection');
    }
    return this.constructor.debugName ? this.constructor.debugName + this.cid.replace('collection', '') : this.cid;
  },

  /**
   * Gets children of this object
   *
   * @return {Array} Whether this object has children
   */
  getChildren: function() {
    return _.map(this.models, function(model) {
      // Pull out component models
      if (model.type === 'Widget' && model.model) {
        return model.model;
      } else {
        return model;
      }
    });
  },

  /**
   * Get a list of all trackable functions for this view instance
   * Ignores certain base and debugging functions
   *
   * @param  {Object}        trackedFunctions     Object to track state
   * @param  {Function}      getTrackableFunction Callback to get wrapper function
   *
   * @return {Array<Object>}                      List of trackable functions
   */
  getFunctions: function(trackedFunctions, getTrackableFunction) {
    // Debug functions shouldn't be debuggable
    var blacklist = {
      constructor: true,
      initialize: true,
      postInitialize: true,
      model: true,
      initDebug: true,
      getFunctions: true,
      getVdomTemplate: true,
      isParent: true,
      getChildren: true,
      getDebugName: true
    };
    var getFunctions = require('../shared/get_functions');
    return getFunctions(trackedFunctions, getTrackableFunction, this, BaseCollection.prototype, blacklist);
  },
  /* develblock:end */

  // Empty default function
  postInitialize: function() {}
}, {
  extend: function(protoProps, staticProps) {
    /* develblock:start */
    // Certain methods of BaseCollection should be unable to be overridden
    var methods = ['initialize'];

    function wrapOverride(first, second) {
      return function() {
        first.apply(this, arguments);
        second.apply(this, arguments);
      };
    }
    for (var i = 0; i < methods.length; i++) {
      if (protoProps[methods[i]]) {
        var msg = 'Collection.' + methods[i] + ' may not be overridden';
        if (staticProps && staticProps.debugName) {
          msg += ' for collection "' + staticProps.debugName + '"';
        }
        logger.warn(msg);
        // Replace attempted override with base version
        protoProps[methods[i]] = wrapOverride(BaseCollection.prototype[methods[i]], protoProps[methods[i]]);
      }
    }
    /* develblock:end */

    return Backbone.Collection.extend.call(this, protoProps, staticProps);
  }
});

// Add nested collection support to models that implement backbone_nested.
// See backbone_nested_spec for examples.
backboneNested.setNestedCollection(BaseCollection);

module.exports = BaseCollection;
