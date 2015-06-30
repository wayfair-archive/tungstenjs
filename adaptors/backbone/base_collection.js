/**
 * Base Collection - Provides generic reusable methods that child collections can inherit from
 */

'use strict';
var Backbone = require('backbone');
var _ = require('underscore');
var BaseModel = require('./base_model');

/**
 * BaseCollection
 *
 * @constructor
 * @class BaseCollection
 */
var BaseCollection = Backbone.Collection.extend({
  model: BaseModel,
  tungstenCollection: true,
  // Calling postInitialize to be consistent with other members
  initialize: function() {
    this.postInitialize();
  },
  // Empty default function
  postInitialize: function() {},
  
  resetRelations: function(options) {
    _.each(this.models, function(model) {
      _.each(model.relations, function(rel, key) {
        if (model.get(key) instanceof BaseCollection) {
          model.get(key).trigger('reset', model, options);
        }
      });
    });
  },

  reset: function(models, options) {
    options = options || {};
    for (var i = 0, l = this.models.length; i < l; i++) {
      this._removeReference(this.models[i]);
    }
    options.previousModels = this.models;
    this._reset();
    this.add(models, _.extend({
      silent: true
    }, options));
    if (!options.silent) {
      this.trigger('reset', this, options);
      this.resetRelations(options);
    }
    return this;
  },

  serialize: _.identity,

  doSerialize: function() {
    return this.serialize(this.map(function(model) {
      return model.doSerialize();
    }));
  }
});

module.exports = BaseCollection;