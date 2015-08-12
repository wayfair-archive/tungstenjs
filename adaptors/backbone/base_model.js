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
  initDebug: function() {
    tungsten.debug.registry.register(this);
    _.bindAll(this, 'getDebugName', 'getChildren', 'isParent');
  },

  getDebugName: function() {
    return this.constructor.debugName ? this.constructor.debugName + this.cid.replace('c', '') : this.cid;
  },

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

  isParent: function() {
    return _.size(this.relations) > 0;
  },

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
            encodedValue: JSON.stringify(value),
            value: value
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
    var methods = ['initialize'];
    for (var i = 0; i < methods.length; i++) {
      if (typeof protoProps[methods[i]] === 'function') {
        logger.warn('Model.' + methods[i] + ' may not be overridden');
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
