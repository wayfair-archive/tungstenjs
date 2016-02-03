/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var AmpersandModel = require('ampersand-model');
var eventBubbler = require('./event_bubbler');
var tungsten = require('../../src/tungsten');
var _ = require('underscore');
var logger = require('../../src/utils/logger');

/**
 * BaseModel
 *
 * @constructor
 * @class BaseModel
 */
var BaseModel = AmpersandModel.extend({
  tungstenModel: true,
  /**
   * Before collections are bound, extend on two extra properties for bubbling
   */
  _initCollections: function() {
    var self = this;
    _.each(this._collections, function(collection, name) {
      self._collections[name] = collection.extend({
        parentProp: name,
        parent: self
      });
    });
    AmpersandModel.prototype._initCollections.call(this);
  },
  initialize: function() {
    /* develblock:start */
    this.initDebug();
    /* develblock:end */
    this.postInitialize();
  },
  postInitialize: function() {},

  reset: function(attrs, options) {
    var opts = _.extend({
      reset: true
    }, options);
    var currentKeys = _.keys(this.getAttributes({
      props: true
    }, true));
    currentKeys = currentKeys.concat(_.keys(this._children), _.keys(this._collections));
    var key;
    for (var i = 0; i < currentKeys.length; i++) {
      key = currentKeys[i];
      if (!_.has(attrs, key)) {
        this.unset(key);
      }
    }
    this.set(attrs, opts);
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
    return this.debugName ? this.debugName + this.cid.replace('state', '') : this.cid;
  },

  /**
   * Gets children of this object
   *
   * @return {Array} Whether this object has children
   */
  getChildren: function() {
    var results = [];
    var self = this;
    _.each(this._children, function(constructor, key) {
      if (self.hasOwnProperty(key)) {
        results.push(self.get(key));
      }
    });
    _.each(this._collections, function(constructor, key) {
      if (self.hasOwnProperty(key)) {
        results.push(self.get(key));
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
      getDebugName: true,
      getPropertiesArray: true
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
    var properties = {
      normal: [],
      relational: [],
      derived: []
    };

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

    var key, value, prop;
    for (key in this._definition) {
      value = this[key];
      prop = {
        key: key,
        data: {
          isEditable: isEditable(value),
          isEditing: false,
          value: value
        }
      };
      prop.data.displayValue = prop.data.isEditable ? JSON.stringify(value) : Object.prototype.toString.call(value);
      properties.normal.push(prop);
    }

    for (key in this._derived) {
      value = this[key];
      properties.derived.push({
        key: key,
        data: {
          isDerived: this._derived[key],
          value: value,
          displayValue: isEditable(value) ? JSON.stringify(value) : Object.prototype.toString.call(value)
        }
      });
    }

    var self = this;
    _.each(this._children, function(constructor, key) {
      var value = self.get(key);
      properties.relational.push({
        key: key,
        data: {
          isRelation: true,
          name: value.getDebugName()
        }
      });
    });
    _.each(this._collections, function(constructor, key) {
      var value = self.get(key);
      properties.relational.push({
        key: key,
        data: {
          isRelation: true,
          name: value.getDebugName()
        }
      });
    });

    return properties;
  },
  /* develblock:end */
  /**
   * Before children are bound, extend on two extra properties for bubbling
   */
  _initChildren: function() {
    var self = this;
    _.each(this._children, function(child, name) {
      self._children[name] = child.extend({
        parentProp: name,
        parent: self
      });
    });
    AmpersandModel.prototype._initChildren.call(this);
  },

  trigger: eventBubbler(AmpersandModel)
});

BaseModel.extend = function(protoProps) {
  /* develblock:start */
  // Certain methods of BaseModel should be unable to be overridden
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
      protoProps[methods[i]] = wrapOverride(BaseModel.prototype[methods[i]], protoProps[methods[i]]);
    }
  }
  /* develblock:end */

  return AmpersandModel.extend.call(this, protoProps);
};

module.exports = BaseModel;
