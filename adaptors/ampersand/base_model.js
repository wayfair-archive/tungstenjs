/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var AmpersandModel = require('ampersand-model');
var eventBubbler = require('./event_bubbler');
var tungsten = require('../../src/tungsten');
var _ = require('underscore');
var logger = require('../../src/utils/logger');

/**
 * BaseModel
 *
 * @constructor
 * @class BaseModel
 */
var BaseModel = AmpersandModel.extend({
  tungstenModel: true,
  /**
   * Before collections are bound, extend on two extra properties for bubbling
   */
  _initCollections: function() {
    var self = this;
    _.each(this._collections, function(collection, name) {
      self._collections[name] = collection.extend({
        parentProp: name,
        parent: self
      });
    });
    AmpersandModel.prototype._initCollections.call(this);
  },
  initialize: function() {
    /* develblock:start */
    this.initDebug();
    /* develblock:end */
    this.postInitialize();
  },
  postInitialize: function() {},
  /* develblock:start */

  /** @type {string} Override cidPrefix to avoid confusion with Collections */
  cidPrefix: 'model',

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
    return this.constructor.debugName ? this.constructor.debugName + this.cid.replace('model', '') : this.cid;
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
            value: value
          }
        });
      }
    });

    return properties;
  },
  /* develblock:end */
  /**
   * Before children are bound, extend on two extra properties for bubbling
   */
  _initChildren: function() {
    var self = this;
    _.each(this._children, function(child, name) {
      self._children[name] = child.extend({
        parentProp: name,
        parent: self
      });
    });
    AmpersandModel.prototype._initCollections.call(this);
  },

  trigger: eventBubbler(AmpersandModel)
});

module.exports = BaseModel;