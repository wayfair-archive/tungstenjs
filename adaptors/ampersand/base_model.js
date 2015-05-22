/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var AmpersandModel = require('ampersand-model');
var eventBubbler = require('./event_bubbler');
var _ = require('underscore');

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
    AmpersandModel.prototype._initCollections.call(this);
  },

  trigger: eventBubbler(AmpersandModel)
});

module.exports = BaseModel;