/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var Backbone = require('backbone');
var backboneNested = require('./backbone_nested');
var hashCollision = require('./hash_collision');
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
      _.each(derived, function(props, name) {
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
            self.listenTo(self, 'update:' + dep, update);
            self.listenTo(self, 'reset:' + dep, update);
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
    var relations = _.result(this, 'relations') || {};
    var derived = _.result(this, 'derived') || {};
    var session = _.invert(_.result(this, 'session') || []);

    var data = {};
    _.each(attrs, function(val, key) {
      // Skip any derived or session properties
      if (!derived[key] && !session[key]) {
        // Recursively serialize any set relations
        if (relations[key] && typeof relations[key].doSerialize === 'function') {
          data[key] = val.doSerialize();
        } else {
          data[key] = val;
        }
      }
    });
    return data;
  },
  extend: hashCollision(Backbone.Model.extend)
});

// Add nested collection/model support with backbone_nested.
// To use, set a hash of relations on a model.
// See backbone_nested_spec for examples.
backboneNested.setNestedModel(BaseModel);

module.exports = BaseModel;