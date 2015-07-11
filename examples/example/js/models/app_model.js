/**
 * Example App Demo for Tungsten.js
 */
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');

var Model = TungstenBackboneBase.Model;
var AppModel = Model.extend({
  initialize: function() {
    console.log('app model created');
  }
});
module.exports = AppModel;