/**
 * Base Collection - Provides generic reusable methods that child collections can inherit from
 */

'use strict';
var AmpersandCollection = require('ampersand-collection');
var eventBubbler = require('./event_bubbler');
var tungsten = require('../../src/tungsten');
var logger = require('../../src/utils/logger');
var _ = require('underscore');

/**
 * BaseCollection
 *
 * @constructor
 * @class BaseCollection
 */
var BaseCollection = AmpersandCollection.extend({
  tungstenCollection: true,
  initialize: function() {
    /* develblock:start */
    this.initDebug();
    /* develblock:end */
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
    var result = [];
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
    for (var key in this) {
      if (typeof this[key] === 'function' && blacklist[key] !== true) {
        result.push({
          name: key,
          fn: this[key],
          inherited: (key in BaseCollection.prototype)
        });
        this[key] = getTrackableFunction(this, key, trackedFunctions);
      }
    }
    return result;
  },
  /* develblock:end */
  postInitialize: function() {},
  trigger: eventBubbler(AmpersandCollection)
});

BaseCollection.extend = function(protoProps) {
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
      var msg = 'Model.' + methods[i] + ' may not be overridden';
      if (protoProps && protoProps.debugName) {
        msg += ' for model "' + protoProps.debugName + '"';
      }
      logger.warn(msg);
      // Replace attempted override with base version
      protoProps[methods[i]] = wrapOverride(BaseCollection.prototype[methods[i]], protoProps[methods[i]]);
    }
  }
  /* develblock:end */

  return AmpersandCollection.extend.call(this, protoProps);
};

module.exports = BaseCollection;
