/**
 * Backbone Nested - Functions to add nested model and collection support
 *
 * Forked from backbone-nested-models@0.5.1 by Bret Little
 *
 * @license MIT
 * @source https://github.com/blittle/backbone-nested-models
 * (MIT LICENSE)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';
var Backbone = require('backbone');
var _ = require('underscore');

var exports = {};
var BackboneModel = Backbone.Model,
  BackboneCollection = Backbone.Collection;

exports.setNestedModel = function(Model) {
  BackboneModel = Model;
  BackboneCollection.prototype.model = BackboneModel;

  Model.prototype.getDeep = function(attr) {
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
  };

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

  Model.prototype.getRelationListener = function(key) {
    if (!this.relationListeners) {
      this.relationListeners = {};
    }

    if (!this.relationListeners[key]) {
      this.relationListeners[key] = _getRelationListener(key);
    }

    return this.relationListeners[key];
  };

  var originalSet = Model.prototype.set;
  Model.prototype.set = function(key, val, options) {
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
              self.get(key).set(val.attributes);
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
  };

  Model.prototype.toJSON = function() {
    var attrs = _.clone(this.attributes);

    _.each(this.relations, function(Rel, key) {
      if (_.has(attrs, key)) {
        attrs[key] = attrs[key].doSerialize();
      } else {
        attrs[key] = (new Rel()).doSerialize();
      }
    });

    return attrs;
  };

  Model.prototype.doSerialize = function() {
    return this.serialize(this.toJSON());
  };

  Model.prototype.serialize = _.identity;

  Model.prototype.clone = function() {
    return new this.constructor(this.toJSON());
  };
};

exports.setNestedCollection = function(Collection) {
  BackboneCollection = Collection;
  BackboneCollection.prototype.model = BackboneModel;
  Collection.prototype.resetRelations = function(options) {
    _.each(this.models, function(model) {
      _.each(model.relations, function(rel, key) {
        if (model.get(key) instanceof Collection) {
          model.get(key).trigger('reset', model, options);
        }
      });
    });
  };

  Collection.prototype.reset = function(models, options) {
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
  };

  Collection.prototype.serialize = _.identity;

  Collection.prototype.doSerialize = function() {
    return this.serialize(this.map(function(model) {
      return model.doSerialize();
    }));
  };
};

module.exports = exports;
