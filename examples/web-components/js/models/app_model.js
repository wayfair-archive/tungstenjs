/**
 * Example App Demo for Tungsten.js
 */
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');

var Model = TungstenBackboneBase.Model;
var AppModel = Model.extend({
  relations: {
    'cities' : TungstenBackboneBase.Collection,
    'selectedCity': TungstenBackboneBase.Model
  }
});
module.exports = AppModel;