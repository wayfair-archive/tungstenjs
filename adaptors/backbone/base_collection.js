/**
 * Base Collection - Provides generic reusable methods that child collections can inherit from
 */

'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var backboneNested = require('./backbone_nested');
var tungsten = require('../../src/tungsten');
var logger = require('../../src/utils/logger');

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

  /* develblock:start */
  initDebug: function() {
    tungsten.debug.registry.register(this);
    _.bindAll(this, 'getDebugName', 'getChildren', 'isParent');
  },

  getDebugName: function() {
    if (!this.cid) {
      this.cid = _.uniqueId('collection');
    }
    return this.constructor.debugName ? this.constructor.debugName + this.cid.replace('collection', '') : this.cid;
  },

  getChildren: function() {
    return this.models;
  },

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

  isParent: function() {
    return this.models.length > 0;
  },
  /* develblock:end */

  postInitialize: function() {}
}, {
  extend: function(protoProps, staticProps) {
    var methods = ['initialize'];
    for (var i = 0; i < methods.length; i++) {
      if (typeof protoProps[methods[i]] === 'function') {
        logger.warn('Collection.' + methods[i] + ' may not be overridden');
      }
    }

    return Backbone.Collection.extend.call(this, protoProps, staticProps);
  }
});

// Add nested collection support to models that implement backbone_nested.
// See backbone_nested_spec for examples.
backboneNested.setNestedCollection(BaseCollection);

module.exports = BaseCollection;
