/**
 * Base Collection - Provides generic reusable methods that child collections can inherit from
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

  /**
   * Forked from backbone-nested-models@0.5.1 by Bret Little
   */
  resetRelations: function(options) {
    _.each(this.models, function(model) {
      _.each(model.relations, function(rel, key) {
        if (model.get(key) instanceof BaseCollection) {
          model.get(key).trigger('reset', model, options);
        }
      });
    });
  },

  /**
   * Forked from backbone-nested-models@0.5.1 by Bret Little
   */
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