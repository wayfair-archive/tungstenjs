/**
 * App Demo for Tungsten.js
 */
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');

var Model = TungstenBackboneBase.Model;
var AppModel = Model.extend({
  postInitialize: function() {
    window.setInterval(() => {
      this.set('time', Date.now());
    }, 1000);
  }
}, {debugName: 'AppModel'});
module.exports = AppModel;
