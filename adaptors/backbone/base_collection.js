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
    this.attachComponents();
    this.postInitialize();
  },

  /* develblock:start */

  /**
   * Bootstraps all debug functionality
   */
  initDebug: function() {
    tungsten.debug.registry.register(this);
    _.bindAll(this, 'getDebugName', 'getChildren');
  },

  attachComponents: function() {
    // Bubble whitelisted events from components
    this.each(function(model) {
      if (ComponentWidget.isComponent(model)) {
        if (model.model &&
          model.model.constructor &&
          model.model.constructor.prototype &&
          model.model.constructor.prototype.exposedEvents) {
          _.each(model.model.constructor.prototype.exposedEvents, function(event) {
            self.listenTo(model.model, event, function() {
              var args = Array.prototype.slice.call(arguments);
              self.trigger.apply(self, [event].concat(args));
            });
          });
        }
      }
    });
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
    return this.models;
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
