/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var Backbone = require('backbone');
var backboneNested = require('./model_bubbler');
var _ = require('underscore');
var hashCollision = require('./hash_collisions');

var _getRelationListener = function(key) {
  return function() {
    var args = _.toArray(arguments);
    var name = args[0];
    if (name.indexOf(':') > -1) {
      var splitName = name.split(':');
      splitName.splice(1, 0, key);
      name = splitName.join(':');
      args[0] = name;
    } else {
      args[0] = name + ' ' + name + ':' + key;
    }
    this.trigger.apply(this, args);
  };
};

/** @type {Function} Saving the original set method since we override it for relations */
var originalSet = Backbone.Model.prototype.set;

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

  getDeep: function(attr) {
    var modelData = this;
    var properties = attr.split(':');
    var prop;
    for (var i = 0; i < properties.length; i++) {
      prop = properties[i];
      modelData = modelData.get && modelData.has(prop) ? modelData.get(prop) : modelData[prop];
      if (modelData == null) {
        break;
      }
    }

    return modelData;
  },

  getRelationListener: function(key) {
    if (!this.relationListeners) {
      this.relationListeners = {};
    }

    if (!this.relationListeners[key]) {
      this.relationListeners[key] = _getRelationListener(key);
    }

    return this.relationListeners[key];
  },

  set: function(key, val, options) {
    var attrs;
    if (key == null) {
      return this;
    }

    // Handle both `'key', value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = options || {};

    var self = this;
    var nonRelationAttrs;
    if (!this.relations) {
      // if there are no relations, there's nothing to do
      nonRelationAttrs = attrs;
    } else {
      nonRelationAttrs = {};
      _.each(attrs, function(val, key) {
        var listener, currentVal;
        if (!_.has(self.relations, key)) {
          // If the key isn't on the relations hash, queue it and move on
          nonRelationAttrs[key] = val;
        } else {
          if (val == null) {
            currentVal = self.get(key);
            if (currentVal) {
              self.stopListening(currentVal, 'all', listener);
            }
            originalSet.call(self, key, val);
          } else if (val.tungstenModel) {
            if (val instanceof self.relations[key]) {
              listener = self.getRelationListener(key);
              currentVal = self.get(key);
              if (currentVal) {
                self.stopListening(currentVal, 'all', listener);
              }
              self.listenTo(val, 'all', listener);
              originalSet.call(self, key, val);
            } else {
              // If the model is the wrong type, clone in the attributes
              // Using toJSON to serialize any relations
              self.get(key).set(val.toJSON());
            }
          } else if (val.tungstenCollection) {
            if (val instanceof self.relations[key]) {
              listener = self.getRelationListener(key);
              currentVal = self.get(key);
              if (currentVal) {
                self.stopListening(self.get(key), 'all', listener);
              }
              self.listenTo(val, 'all', listener);
              originalSet.call(self, key, val);
            } else {
              // Reset if array?
              // If the collection is the wrong type, copy in the models
              self.get(key).set(val.models);
            }
          } else {
            currentVal = self.get(key);
            if (!currentVal) {
              listener = self.getRelationListener(key);
              currentVal = new self.relations[key](val);
              self.listenTo(currentVal, 'all', listener);
              originalSet.call(self, key, currentVal);
            } else {
              if (currentVal.tungstenCollection) {
                // Reset if array?
                currentVal.set(val);
              } else {
                currentVal.set(val);
              }
            }
          }
        }
      });
    }

    return originalSet.call(this, nonRelationAttrs, options);
  },

  /**
   * Derived and session variables should be stripped from data
   */
  toJSON: function() {
    var attrs = this.attributes;
    var derived = _.result(this, 'derived') || {};
    var session = _.invert(_.result(this, 'session') || []);

    // Serialize relations
    _.each(this.relations, function(Rel, key) {
      if (_.has(attrs, key)) {
        attrs[key] = attrs[key].doSerialize();
      } else {
        attrs[key] = (new Rel()).doSerialize();
      }
    });

    var data = {};
    // Remove derived and session properties
    _.each(attrs, function(val, key) {
      if (!derived[key] && !session[key]) {
        data[key] = val;
      }
    });
    return data;
  },

  doSerialize: function() {
    return this.serialize(this.toJSON());
  },

  serialize: _.identity,

  clone: function() {
    return new this.constructor(this.toJSON());
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

module.exports = BaseModel;