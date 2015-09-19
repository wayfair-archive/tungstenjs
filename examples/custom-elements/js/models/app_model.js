/**
 * Custom Elements Demo for Tungsten.js
 */
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');

var Model = TungstenBackboneBase.Model;
var AppModel = Model.extend({
  defaults: {
    count: 0
  },
  postInitialize: function() {
    console.log('app model initialized');
    var self = this;
    window.setInterval(function() {
      self.set('count', self.get('count') + 1);
    }, 500);
  }
});
module.exports = AppModel;
