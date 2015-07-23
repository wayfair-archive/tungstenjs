/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */

/******************************************************************************************
 *
 * Indicated methods forked from backbone-nested-models@0.5.1 by Bret Little
 *
 * @license MIT
 * @source https://github.com/blittle/backbone-nested-models
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the 'Software'), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *   THE SOFTWARE.
 */
'use strict';
var Backbone = require('backbone');
var _ = require('underscore');
var hashCollision = require('./hash_collision');

var bubbleEvent = function(parent, parentProp, args) {
  var name = args[0];
  if (name.indexOf(' ') > -1) {
    // If multiple events are passed in, split them up and recurse individually
    var names = name.split(/\s+/);
    for (var i = 0; i < names.length; i++) {
      var otherArgs = args.slice(1);
      bubbleEvent(parent, parentProp, [names[i]].concat(otherArgs));
    }
  } else if (name.indexOf(':') > -1) {
    // If we're bubbling a relation event, add this relation into the chain and bubble
    var splitName = name.split(':');
    splitName.splice(1, 0, parentProp);
    args[0] = splitName.join(':');
    parent.trigger.apply(parent, args);
  } else if (name === 'change') {
    // Change is unique because the first argument should be the model that was changed
    // Since we bubble a raw change event for each parent model, the first arg needs to change
    // Bubble relation changed with existing context
    args[0] = name + ':' + parentProp;
    parent.trigger.apply(parent, args);
    // Bubble root change with parent as context
    args[0] = name;
    args[1] = parent;
    parent.trigger.apply(parent, args);
  } else if (name === 'reset' || name === 'add' || name === 'remove' || name === 'sort' || name === 'update') {
    // Collection events should just be bubbled as a singular relation
    args[0] = name + ':' + parentProp;
    parent.trigger.apply(parent, args);
  } else {
    // If it's any other event, add the relation on and bubble
    args[0] = name + ' ' + name + ':' + parentProp;
    parent.trigger.apply(parent, args);
  }
};

var _getRelationListener = function(key) {
  return function() {
    var args = _.toArray(arguments);
    bubbleEvent(this, key, args);
  };
};

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
            self.listenTo(self, 'update:' + dep, update);
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

  _get: Backbone.Model.prototype.get,

  getDeep: function(attr) {
    return this.get(attr);
  },

  get: function(attr) {
    var properties = attr.split(':');
    if (properties.length === 1) {
      return this._get(attr);
    } else {
      var modelData = this;
      var prop;
      for (var i = 0; i < properties.length; i++) {
        prop = properties[i];
        modelData = modelData._get && modelData.has(prop) ? modelData._get(prop) : modelData[prop];
        if (modelData == null) {
          break;
        }
      }

      return modelData;
    }
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

  _set: Backbone.Model.prototype.set,

  setDeep: function(key, val, options) {
    return this.set(key, val, options);
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
    // Options plus silent for use in replacing relations
    var optsAndSilent = _.extend({}, options, {silent:true});

    var self = this;
    var thisAttrs = {};
    _.each(attrs, function(val, key) {
      if (key.indexOf(':') === -1) {
        thisAttrs[key] = val;
      } else {
        var completed = false;
        var props = key.split(':');
        var lastPart;
        while (!completed) {
          lastPart = props.pop();
          var model = self.get(props.join(':'));
          if (model != null) {
            if (typeof model.set === 'function') {
              model.set(lastPart, val, options);
            } else {
              model[lastPart] = val;
            }
            completed = true;
          } else {
            var newVal = {};
            newVal[lastPart] = val;
            val = newVal;
          }
        }
      }
    });

    attrs = thisAttrs;

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
            self._set(key, val, options);
          } else if (val.tungstenModel) {
            if (val instanceof self.relations[key]) {
              listener = self.getRelationListener(key);
              currentVal = self.get(key);
              var currentAttributes = {};
              if (currentVal) {
                currentAttributes = currentVal.toJSON();
                self.stopListening(currentVal, 'all', listener);
              }
              self.listenTo(val, 'all', listener);
              val.parent = self;
              var newAttributes = val.toJSON();
              self._set(key, val, optsAndSilent);
              val._set(currentAttributes, optsAndSilent);
              val.set(newAttributes, options);
              if (!options.silent) {
                self.trigger('replace:' + key, val);
              }
            } else {
              if (self.has(key)) {
                // If the model is the wrong type, clone in the attributes
                // Using toJSON to serialize any relations
                self.get(key).set(val.toJSON());
              } else {
                self.set(key, val.toJSON());
              }
            }
          } else if (val.tungstenCollection) {
            if (val instanceof self.relations[key]) {
              listener = self.getRelationListener(key);
              currentVal = self.get(key);
              var currentModels = [];
              if (currentVal) {
                currentModels = currentVal.models;
                self.stopListening(self.get(key), 'all', listener);
              }
              self.listenTo(val, 'all', listener);
              val.parent = self;
              var newModels = val.models;
              self._set(key, val, optsAndSilent);
              val.reset(currentModels, optsAndSilent);
              val.set(newModels, options);
            } else {
              // If the collection is the wrong type, copy in the serialized models
              if (self.has(key)) {
                self.get(key)[options.reset ? 'reset' : 'set'](val.toJSON());
              } else {
                self.set(key, val.toJSON());
              }
            }
          } else {
            currentVal = self.get(key);
            if (!currentVal) {
              listener = self.getRelationListener(key);
              currentVal = new self.relations[key](val);
              currentVal.parent = self;
              self.listenTo(currentVal, 'all', listener);
              self._set(key, currentVal);
            } else {
              if (currentVal.tungstenCollection) {
                currentVal[options.reset ? 'reset' : 'set'](val);
              } else {
                currentVal.set(val);
              }
            }
          }
        }
      });
    }

    return this._set(nonRelationAttrs, options);
  },

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

  doSerialize: function() {
    return this.serialize(this.toJSON());
  },

  serialize: _.identity,

  /**
   * Forked from backbone-nested-models@0.5.1 by Bret Little
   */
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