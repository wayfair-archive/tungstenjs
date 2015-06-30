/**
 * Base Model - Provides generic reusable methods that child models can inherit from
 */
'use strict';
var Backbone = require('backbone');
var backboneNested = require('./model_bubbler');
var hashCollision = require('./hash_collisions');
/**
 * BaseModel
 *
 * @constructor
 * @class BaseModel
 */
var BaseModel = Backbone.Model.extend({
  tungstenModel: true
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

// Add nested collection/model support with backbone_nested.
// To use, set a hash of relations on a model.
// See backbone_nested_spec for examples.
backboneNested.setNestedModel(BaseModel);

module.exports = BaseModel;