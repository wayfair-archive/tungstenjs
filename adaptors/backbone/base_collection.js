/**
 * Base Collection - Provides generic reusable methods that child collections can inherit from
 */

'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var tungsten = require('../../src/tungsten');
var logger = require('../../src/utils/logger');

var eventTrigger = require('./event_trigger');
var ComponentWidget = require('./component_widget');
var BaseModel = require('./base_model');

/**
 * BaseCollection
 *
 * @constructor
 * @class BaseCollection
 */
var BaseCollection = Backbone.Collection.extend({
  tungstenCollection: true,
  initialize: function() {
    if (TUNGSTENJS_DEBUG_MODE) {
    this.initDebug();
    }
    this.postInitialize();
  },

  bindExposedEvent: function(event, childComponent) {
    this.listenTo(childComponent.model, event, function() {
      var args = Array.prototype.slice.call(arguments);
      this.trigger.apply(this, [event].concat(args));
      if (event.substr(0, 7) === 'change:') {
        this.trigger('change', this);
      }
    });
  },

  /**
   * Method for checking whether an object should be considered a model for
   * the purposes of adding to the collection.
   *
   * Overriding to allow ComponentWidgets to be treated as models
   *
   * @param  {Object}  model Model to check
   * @return {Boolean}
   */
  _isModel: function(model) {
    return Backbone.Collection.prototype._isModel(model) || model instanceof ComponentWidget;
  },

  /**
   * Binds events when a model is added to a collection
   *
   * @param {Object} model
   * @param {Object} options
   */
  _addReference: function(model, options) {
    Backbone.Collection.prototype._addReference.call(this, model, options);
    if (ComponentWidget.isComponent(model) && model.exposedEvents) {
      var events = model.exposedEvents;
      if (events === true) {
        model.model.on('all', this._onModelEvent, this);
      } else if (events.length) {
        for (let i = 0; i < events.length; i++) {
          this.bindExposedEvent(events[i], model);
        }
      }
    }
  },

  /**
   * Unbinds events when a model is removed from a collection
   *
   * @param {Object} model
   * @param {Object} options
   */
  _removeReference: function(model, options) {
    if (ComponentWidget.isComponent(model) && model.model && model.exposedEvents) {
      var events = model.exposedEvents;
      if (events === true) {
        model.model.off('all', this._onModelEvent, this);
      } else if (events.length) {
        for (let i = 0; i < events.length; i++) {
          this.stopListening(model.model, events[i]);
        }
      }
    }
    Backbone.Collection.prototype._removeReference.call(this, model, options);
  },
  // Empty default function
  postInitialize: function() {}
}, {
  extend: function(protoProps, staticProps) {
    if (TUNGSTENJS_DEBUG_MODE) {
    // Certain methods of BaseCollection should be unable to be overridden
    var methods = ['initialize'];

    function wrapOverride(first, second) {
      return function() {
        first.apply(this, arguments);
        second.apply(this, arguments);
      };
    }

    for (let i = 0; i < methods.length; i++) {
      if (protoProps[methods[i]]) {
        var msg = 'Collection.' + methods[i] + ' may not be overridden';
        if (staticProps && staticProps.debugName) {
          msg += ' for collection "' + staticProps.debugName + '"';
        }
        logger.warn(msg);
        // Replace attempted override with base version
        protoProps[methods[i]] = wrapOverride(BaseCollection.prototype[methods[i]], protoProps[methods[i]]);
      }
    }
    }

    return Backbone.Collection.extend.call(this, protoProps, staticProps);
  }
});

if (TUNGSTENJS_DEBUG_MODE) {
  BaseCollection = BaseCollection.extend({
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
      if (!this.cid) {
        this.cid = _.uniqueId('collection');
      }
      return this.constructor.debugName ? this.constructor.debugName + this.cid.replace('collection', '') : this.cid;
    },

    toString: function() {
      return '[' + this.getDebugName() + ']';
    },

    /**
     * Gets children of this object
     *
     * @return {Array} Whether this object has children
     */
    getChildren: function() {
      return _.map(this.models, function(model) {
        // Pull out component models
        if (model.type === 'Widget' && model.model) {
          return model.model;
        } else {
          return model;
        }
      });
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
        postInitialize: true,
        model: true,
        initDebug: true,
        getFunctions: true,
        getVdomTemplate: true,
        isParent: true,
        getChildren: true,
        getDebugName: true,
        toString: true
      };
      var getFunctions = require('../shared/get_functions');
      return getFunctions(trackedFunctions, getTrackableFunction, this, BaseCollection.prototype, blacklist);
    }
  });
}

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
BaseCollection.prototype.model = BaseModel;
BaseCollection.prototype.resetRelations = function(options) {
  _.each(this.models, function(model) {
    _.each(model.relations, function(rel, key) {
      if (model.get(key) instanceof Backbone.Collection) {
        model.get(key).trigger('reset', model, options);
      }
    });
  });
};

BaseCollection.prototype.trigger = eventTrigger.newTrigger;

BaseCollection.prototype.reset = function(models, options = {}) {
  var i, l;
  if (TUNGSTENJS_DEBUG_MODE) {
  if (!this.initialData) {
    // Using JSON to get a deep clone to avoid any overlapping object references
    var initialStr = JSON.stringify(_.has(options, 'initialData') ? options.initialData : models);
    delete options.initialData;
    this.initialData = JSON.parse(initialStr);
    var allObjects = true;
    for (i = 0; i < models.length; i++) {
      if (!_.isObject(models[i]) || _.isArray(models[i])) {
        allObjects = false;
        break;
      }
    }
    if (!allObjects || !_.isArray(this.initialData)) {
      logger.warn('Collection expected array of objects but got: ' + initialStr);
    }
  }
  }
  for (i = 0, l = this.models.length; i < l; i++) {
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
};

BaseCollection.prototype.serialize = _.identity;

BaseCollection.prototype.doSerialize = function() {
  return this.serialize(this.map(function(model) {
    return model.doSerialize();
  }));
};

module.exports = BaseCollection;
