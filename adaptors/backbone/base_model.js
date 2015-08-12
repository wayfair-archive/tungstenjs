/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var backboneNested = require('./backbone_nested');
var tungsten = require('../../src/tungsten');
var logger = require('../../src/utils/logger');
/**
 * BaseModel
 *
 * @constructor
 * @class BaseModel
 */
var BaseModel = Backbone.Model.extend({
  tungstenModel: true,
  initialize: function() {
    /* develblock:start */
    this.initDebug();
    /* develblock:end */
    this.postInitialize();
  },

  /* develblock:start */

  /** @type {string} Override cidPrefix to avoid confusion with Collections */
  cidPrefix: 'model',

  /**
   * Bootstraps all debug functionality
   */
  initDebug: function() {
    tungsten.debug.registry.register(this);
    _.bindAll(this, 'getDebugName', 'getChildren', 'isParent');
  },

  /**
   * Debug name of this object, using declared debugName, falling back to cid
   *
   * @return {string} Debug name
   */
  getDebugName: function() {
    return this.constructor.debugName ? this.constructor.debugName + this.cid.replace('model', '') : this.cid;
  },

  /**
   * Determines if this object is a parent for debug panel display purposes
   *
   * @return {Boolean} Whether this object has children
   */
  isParent: function() {
    var children = this.getChildren();
    return children.length > 0;
  },

  /**
   * Gets children of this object
   *
   * @return {Array} Whether this object has children
   */
  getChildren: function() {
    var results = [];
    var self = this;
    _.each(this.relations, function(constructor, key) {
      if (self.has(key)) {
        results.push(self.get(key));
      }
    });
    return results;
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
    var result = [];
    // Debug functions shouldn't be debuggable
    var blacklist = {
      constructor: true,
      initialize: true,
      set: true,
      postInitialize: true,
      initDebug: true,
      getFunctions: true,
      getVdomTemplate: true,
      isParent: true,
      getChildren: true,
      getDebugName: true
    };
    for (var key in this) {
      if (typeof this[key] === 'function' && blacklist[key] !== true) {
        result.push({
          name: key,
          fn: this[key],
          inherited: (key in BaseModel.prototype)
        });
        this[key] = getTrackableFunction(this, key, trackedFunctions);
      }
    }
    return result;
  },

  /**
   * Get array of attributes, so it can be iterated on
   *
   * @return {Array<Object>} List of attribute key/values
   */
  getPropertiesArray: function() {
    var properties = [];
    var relations = this.relations;
    _.each(this.attributes, function(value, key) {
      if (relations && relations[key]) {
        properties.push({
          key: key,
          data: {
            isRelation: true,
            name: value.getDebugName()
          }
        });
      } else {
        properties.push({
          key: key,
          data: {
            isEditing: false,
            // Stringify values so that they can be displayed properly
            value: JSON.stringify(value)
          }
        });
      }
    });

    return properties;
  },
  /* develblock:end */

  postInitialize: function() {}
}, {
  extend: function(protoProps, staticProps) {
    // Certain methods of BaseModel should be unable to be overridden
    var methods = ['initialize'];
    for (var i = 0; i < methods.length; i++) {
      if (protoProps[methods[i]]) {
        var msg = 'Model.' + methods[i] + ' may not be overridden';
        if (staticProps.debugName) {
          msg += ' for model "' + staticProps.debugName + '"';
        }
        logger.warn(msg);
        // Replace attempted override with base version
        protoProps[methods[i]] = BaseModel.prototype[methods[i]];
      }
    }

    return Backbone.Model.extend.call(this, protoProps, staticProps);
  }
});

// Add nested collection/model support with backbone_nested.
// To use, set a hash of relations on a model.
// See backbone_nested_spec for examples.
backboneNested.setNestedModel(BaseModel);

module.exports = BaseModel;
