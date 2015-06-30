/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var Backbone = require('backbone');
var backboneNested = require('./model_bubbler');
var _ = require('underscore');
var hashCollision = require('./hash_collisions');
/**
 * BaseModel
 *
 * @constructor
 * @class BaseModel
 */
var BaseModel = Backbone.Model.extend({
  tungstenModel: true,

  /**
   * Setup derived property listeners
   */
  initialize: function() {
    var derived = _.result(this, 'derived');
    var relations = _.result(this, 'relations') || {};
    if (derived) {
      var self = this;
      _.each(derived, function (props, name) {
        // Check if a collection relation is declared
        var isCollection = false;
        if (relations[name] && relations[name].tungstenCollection) {
          isCollection = true;
        }
        if (props.fn && props.deps) {
          var fn = _.bind(props.fn, self);
          var update = isCollection ? function() {
            self.getDeep(name).reset(fn());
          } : function() {
            self.set(name, fn());
          };
          _.each(props.deps, function(dep) {
            self.listenTo(self, 'change:' + dep, update);
          });
          // Sets default value
          update();
        }
      });
    }

    this.postInitialize();
  },
  // Empty default function
  postInitialize: function() {},

  /**
   * Derived and session variables should be stripped from data
   */
  toJSON: function() {
    var attrs = this.attributes;
    var derived = _.result(this, 'derived') || {};
    var session = _.invert(_.result(this, 'session') || []);
    var data = {};
    _.each(attrs, function(val, key) {
      if (!derived[key] && !session[key]) {
        data[key] = val;
      }
    });
    return data;
  }
}, {
  /**
   * Override of extend to provide basic mixin functionality for colliding hashes
   * Useful for derived, and relations
   *
   * @param  {Object}   options  Properties to extend for new Model
   * @return {Function}          Constructor function for child model
   */
  extend: hashCollision(Backbone.Model.extend)
});

// Add nested collection/model support with backbone_nested.
// To use, set a hash of relations on a model.
// See backbone_nested_spec for examples.
backboneNested.setNestedModel(BaseModel);

module.exports = BaseModel;