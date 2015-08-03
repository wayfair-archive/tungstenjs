/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var backboneNested = require('./backbone_nested');
var tungsten = require('../../src/tungsten');
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
      results.push(self.get(key));
    });
    return results;
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
          value: {
            isRelation: true,
            name: value.getDebugName()
          }
        });
      } else {
        properties.push({
          key: key,
          value: value
        });
      }
    });

    return properties;
  },
  /* develblock:end */

  postInitialize: function() {}
});

// Add nested collection/model support with backbone_nested.
// To use, set a hash of relations on a model.
// See backbone_nested_spec for examples.
backboneNested.setNestedModel(BaseModel);

module.exports = BaseModel;