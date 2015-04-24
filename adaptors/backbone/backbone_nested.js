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

var originalTrigger = Backbone.Events.trigger;
var newTrigger = function(name) {
  originalTrigger.apply(this, arguments);
  // Collections naturally get events from their models so this only bubbles through relations
  if (this.parentProp && this.parent) {
    if (name.indexOf(':') > -1) {
      var splitName = name.split(':');
      splitName.splice(1, 0, this.parentProp);
      name = splitName.join(':');
      arguments[0] = name;
    } else {
      arguments[0] = name + ' ' + name + ':' + this.parentProp;
    }
    this.parent.trigger.apply(this.parent, arguments);
  }
};

exports.setEventTrigger = function(triggerToSet) {
  newTrigger = triggerToSet;
  BackboneModel.prototype.trigger = triggerToSet;
};

exports.setNestedModel = function(Model) {
  BackboneModel = Model;
  BackboneCollection.prototype.model = BackboneModel;
  Model.prototype.getDeep = function(attr) {
    var modelData = this;
    var properties = attr.split(':');
    for (var i = 0; i < properties.length; i++) {
      modelData = modelData.get ? modelData.get(properties[i]) : modelData[properties[i]];
    }

    return modelData;
  };
  Model.prototype.setRelation = function(attr, val, options) {
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
      if (relation && relation instanceof BackboneCollection) {

        // If the val that is being set is already a collection, use the models
        // within the collection.
        if (val instanceof BackboneCollection || val instanceof Array) {
          val = val.models || val;
          modelsToAdd = _.clone(val);

          relation.each(function(model, i) {

            // If the model does not have an 'id' skip logic to detect if it already
            // exists and simply add it to the collection
            if (typeof model[id] === 'undefined') {
              return;
            }

            // If the incoming model also exists within the existing collection,
            // call set on that model. If it doesn't exist in the incoming array,
            // then add it to a list that will be removed.
            var rModel = _.find(val, function(_model) {
              return _model[id] === model[id];
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

      if (relation && relation instanceof Model) {
        relation.set(val);
        return relation;
      }

      options._parent = this;

      val = new this.relations[attr](val, options);
      val.parent = this;
      val.parentProp = attr;
    }

    return val;
  };

  Model.prototype.trigger = newTrigger;

  Model.prototype.set = function(key, val, options) {
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

    // For each `set` attribute, update or delete the current value.
    for (attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        val = attrs[attr];

        // Inject in the relational lookup
        val = this.setRelation(attr, val, options);

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
      }
    }

    // Trigger all relevant attribute changes.
    if (!silent) {
      if (changes.length) {
        this._pending = true;
      }
      for (var i = 0, l = changes.length; i < l; i++) {
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
        if (model.get(key) instanceof Backbone.Collection) {
          model.get(key).trigger('reset', model, options);
        }
      });
    });
  };

  Collection.prototype.trigger = newTrigger;

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