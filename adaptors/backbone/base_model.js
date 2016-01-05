/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var tungsten = require('../../src/tungsten');
var logger = require('../../src/utils/logger');
var ComponentWidget = require('./component_widget');
var eventTrigger = require('./event_trigger');
/**
 * BaseModel
 *
 * @constructor
 * @class BaseModel
 */
var BaseModel = Backbone.Model.extend({
  tungstenModel: true,
  initialize: function(attributes, options) {
    /* develblock:start */
    this.initDebug();
    /* develblock:end */
    var derived = _.result(this, 'derived');
    var relations = _.result(this, 'relations') || {};
    if (derived) {
      _.each(derived, (props, name) => {
        // Check if a collection relation is declared
        var isCollection = false;
        if (relations[name] && relations[name].tungstenCollection) {
          isCollection = true;
        }
        if (props.fn && props.deps) {
          var fn = _.bind(props.fn, this);
          var update = isCollection ? () => {
            this.getDeep(name).reset(fn());
          } : () => {
            this.set(name, fn());
          };
          _.each(props.deps, (dep) => {
            this.listenTo(this, 'change:' + dep, update);
            this.listenTo(this, 'update:' + dep, update);
            this.listenTo(this, 'reset:' + dep, update);
          });
          // Sets default value
          update();
        }
      });
    }
    this.postInitialize(attributes, options);
  },

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
    _.each(this.relations, (constructor, key) => {
      if (this.has(key)) {
        var value = this.get(key);
        // Pull out component models
        if (value && value.type === 'Widget' && value.model) {
          value = value.model;
        }
        results.push(value);
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
    var getFunctions = require('../shared/get_functions');
    return getFunctions(trackedFunctions, getTrackableFunction, this, BaseModel.prototype, blacklist);
  },

  /**
   * Get array of attributes, so it can be iterated on
   *
   * @return {Array<Object>} List of attribute key/values
   */
  getPropertiesArray: function() {
    var properties = [];
    var relations = _.result(this, 'relations') || {};
    var derived = _.result(this, 'derived') || {};

    var isEditable = function(value) {
      if (!_.isObject(value)) {
        return true;
      } else if (_.isArray(value)) {
        var result = true;
        _.each(value, function(i) {
          result = result && isEditable(i);
        });
        return result;
      } else {
        try {
          JSON.stringify(value);
          return true;
        } catch (ex) {
          return false;
        }
      }
    };

    _.each(this.attributes, function(value, key) {
      var prop;
      if (relations && relations[key]) {
        prop = {
          key: key,
          data: {
            isRelation: true,
            name: value.getDebugName()
          }
        };
      } else {
        prop = {
          key: key,
          data: {
            isDerived: !!derived[key],
            isEditable: isEditable(value),
            isEditing: false,
            value: value
          }
        };

        prop.data.displayValue = prop.data.isEditable ? JSON.stringify(value) : Object.prototype.toString.call(value);
      }
      properties.push(prop);
    });

    properties = _.sortBy(properties, 'key');

    return properties;
  },
  /* develblock:end */

  // Empty default function
  postInitialize: function() {}
}, {
  extend: function(protoProps, staticProps) {
    /* develblock:start */
    // Certain methods of BaseModel should be unable to be overridden
    var methods = ['initialize'];

    function wrapOverride(first, second) {
      return function() {
        first.apply(this, arguments);
        second.apply(this, arguments);
      };
    }
    for (let i = 0; i < methods.length; i++) {
      if (protoProps[methods[i]]) {
        var msg = 'Model.' + methods[i] + ' may not be overridden';
        if (staticProps && staticProps.debugName) {
          msg += ' for model "' + staticProps.debugName + '"';
        }
        logger.warn(msg);
        // Replace attempted override with base version
        protoProps[methods[i]] = wrapOverride(BaseModel.prototype[methods[i]], protoProps[methods[i]]);
      }
    }
    /* develblock:end */

    return Backbone.Model.extend.call(this, protoProps, staticProps);
  }
});

/**
 * Backbone Nested - Functions to add nested model and collection support. *
 * Forked from backbone-nested-models@0.5.1 by Bret Little
 *
 *    @source https://github.com/blittle/backbone-nested-models
 *    (MIT LICENSE)
 *    Copyright (c) 2012 Bret Little
 *    Permission is hereby granted, free of charge, to any person obtaining a copy
 *    of this software and associated documentation files (the 'Software'), to deal
 *    in the Software without restriction, including without limitation the rights
 *    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *    copies of the Software, and to permit persons to whom the Software is
 *    furnished to do so, subject to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be included in
 *    all copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *    THE SOFTWARE.
 */

BaseModel.prototype.getDeep = function(attr) {
  var modelData = this;
  var properties = attr.split(':');
  var prop;
  for (let i = 0; i < properties.length; i++) {
    prop = properties[i];
    modelData = modelData.get && modelData.has(prop) ? modelData.get(prop) : modelData[prop];
    if (modelData == null) {
      break;
    }
  }

  return modelData;
};
BaseModel.prototype.setRelation = function(attr, val, options) {
  var relation = this.attributes[attr],
    id = this.idAttribute || 'id',
    modelsToAdd = [],
    modelsToRemove = [];

  if (options.unset && relation) {
    delete relation.parent;
  }


  if (this.relations && _.has(this.relations, attr)) {

    // If the relation already exists, we don't want to replace it, rather
    // update the data within it whether it is a collection or model
    if (relation && relation instanceof Backbone.Collection) {

      // If the val that is being set is already a collection, use the models
      // within the collection.
      if (val instanceof Backbone.Collection || val instanceof Array) {
        val = val.models || val;
        modelsToAdd = _.clone(val);

        if (options.reset) {
          // Adding option to reset nested collections via Model.set
          relation.reset(modelsToAdd);
        } else {

          relation.each(function(model, i) {
            var idAttribute;
            if (ComponentWidget.isComponent(model)) {
              idAttribute = model.model.idAttribute || 'id';
            } else {
              idAttribute = model.idAttribute || 'id';
            }

            // If the model does not have an 'id' skip logic to detect if it already
            // exists and simply add it to the collection
            var id = model.get(idAttribute);
            if (typeof id === 'undefined') {
              return;
            }

            // If the incoming model also exists within the existing collection,
            // call set on that model. If it doesn't exist in the incoming array,
            // then add it to a list that will be removed.
            var rModel = _.find(val, function(_model) {
              return _model[idAttribute] === id;
            });

            if (rModel) {
              model.set(rModel.toJSON ? rModel.toJSON() : rModel);

              // Remove the model from the incoming list because all remaining models
              // will be added to the relation
              modelsToAdd.splice(i, 1);
            } else {
              modelsToRemove.push(model);
            }

          });

          _.each(modelsToRemove, function(model) {
            relation.remove(model);
          });

          relation.add(modelsToAdd);
        }

      } else {

        // The incoming val that is being set is not an array or collection, then it represents
        // a single model.  Go through each of the models in the existing relation and remove
        // all models that aren't the same as this one (by id). If it is the same, call set on that
        // model.

        relation.each(function(model) {
          if (val && val[id] === model[id]) {
            model.set(val);
          } else {
            relation.remove(model);
          }
        });
      }

      return relation;
    }

    if (relation && relation instanceof Backbone.Model) {
      relation.set(val);
      return relation;
    }

    options._parent = this;
    // Since this is a relation for a model, unset any collection option that might be passed through
    if (options.collection) {
      options.collection = null;
    }
    val = new this.relations[attr](val, options);
    val.parent = this;
    val.parentProp = attr;
  }

  return val;
};

BaseModel.prototype.trigger = eventTrigger.newTrigger;

BaseModel.prototype.reset = function(attrs, options) {
  var opts = _.extend({
    reset: true
  }, options);
  var currentKeys = _.keys(this.attributes);
  var relations = _.result(this, 'relations') || {};
  var derived = _.result(this, 'derived') || {};
  var key;
  for (let i = 0; i < currentKeys.length; i++) {
    key = currentKeys[i];
    if (_.has(relations, key)) {
      this.attributes[key].reset(attrs[key], opts);
      delete attrs[key];
    } else if (!_.has(attrs, key) && !_.has(derived, key)) {
      this.unset(key);
    }
  }
  this.set(attrs, opts);
};

BaseModel.prototype.bindExposedEvent = function(event, prop, childComponent) {
  this.listenTo(childComponent.model, event, () => {
    var args = Array.prototype.slice.call(arguments);
    eventTrigger.bubbleEvent(this, prop, [event].concat(args));
  });
};

BaseModel.prototype.set = function(key, val, options) {
  var attr, attrs, unset, changes, silent, changing, prev, current;
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

  /* develblock:start */
  // In order to compare server vs. client data, save off the initial data
  if (!this.initialData) {
    // Using JSON to get a deep clone to avoid any overlapping object references
    var initialStr = JSON.stringify(_.has(options, 'initialData') ? options.initialData : attrs);
    delete options.initialData;
    this.initialData = JSON.parse(initialStr);
    if (!_.isObject(this.initialData) || _.isArray(this.initialData)) {
      logger.warn('Model expected object of attributes but got: ' + initialStr);
    }
  }
  /* develblock:end */

  // Run validation.
  if (!this._validate(attrs, options)) {
    return false;
  }

  // Extract attributes and options.
  unset = options.unset;
  silent = options.silent;
  changes = [];
  changing = this._changing;
  this._changing = true;

  if (!changing) {
    this._previousAttributes = _.clone(this.attributes);
    this.changed = {};
  }
  current = this.attributes;
  prev = this._previousAttributes;

  // Check for changes of `id`.
  if (this.idAttribute in attrs) {
    this.id = attrs[this.idAttribute];
  }

  var i, l;

  // For each `set` attribute, update or delete the current value.
  for (attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      val = attrs[attr];
      if (val === null) {
        continue;
      }

      // Inject in the relational lookup
      var opts = options;
      /* develblock:start */
      opts = _.extend({
        initialData: val
      }, options);
      /* develblock:end */
      val = this.setRelation(attr, val, opts);

      if (!_.isEqual(current[attr], val)) {
        changes.push(attr);
      }
      if (!_.isEqual(prev[attr], val)) {
        this.changed[attr] = val;
      } else {
        delete this.changed[attr];
      }
      if (unset) {
        delete current[attr];
      } else {
        current[attr] = val;
      }

      if (ComponentWidget.isComponent(val)) {
        if (val.exposedEvents) {
          var events = val.exposedEvents;
          if (events === true) {
            val.model.parent = this;
            val.model.parentProp = attr;
          } else if (events.length) {
            for (i = 0, l = events.length; i < l; i++) {
              this.bindExposedEvent(events[i], attr, val);
            }
          }
        }
      }
    }
  }

  // Trigger all relevant attribute changes.
  if (!silent) {
    if (changes.length) {
      this._pending = true;
    }
    for (i = 0, l = changes.length; i < l; i++) {
      this.trigger('change:' + changes[i], this, current[changes[i]], options);
    }
  }

  if (changing) {
    return this;
  }
  if (!silent) {
    while (this._pending) {
      this._pending = false;
      this.trigger('change', this, options);
    }
  }
  this._pending = false;
  this._changing = false;

  return this;
};

// Remove an attribute from the model, firing `"change"`. `unset` is a noop
// if the attribute doesn't exist.
BaseModel.prototype.unset = function(attr, options) {
  if (this.has(attr)) {
    var val = this.get(attr);
    if (ComponentWidget.isComponent(val)) {
      if (val.model && val.exposedEvents) {
        var events = val.exposedEvents;
        if (events === true) {
          val.model.parent = null;
          val.model.parentProp = null;
        } else if (events.length) {
          for (let i = 0, l = events.length; i < l; i++) {
            this.stopListening(val.model, events[i]);
          }
        }
      }
    }
  }
  return this.set(attr, void 0, _.extend({}, options, {
    unset: true
  }));
};

BaseModel.prototype.toJSON = function() {
  var attrs = this.attributes;
  var relations = _.result(this, 'relations') || {};
  var derived = _.result(this, 'derived') || {};
  var session = _.invert(_.result(this, 'session') || []);

  var data = {};
  _.each(attrs, function(val, key) {
    // Skip any derived or session properties
    if (!derived[key] && !session[key]) {
      // Recursively serialize any set relations
      if (relations[key] && typeof val.doSerialize === 'function') {
        data[key] = val.doSerialize();
      } else {
        data[key] = val;
      }
    }
  });
  return data;
};

BaseModel.prototype.doSerialize = function() {
  return this.serialize(this.toJSON());
};

BaseModel.prototype.serialize = _.identity;

BaseModel.prototype.clone = function() {
  return new this.constructor(this.toJSON());
};


module.exports = BaseModel;
