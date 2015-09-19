/**
* Custom Elements Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;

var AppView = View.extend({
  postInitialize: function() {
    console.log('app view initialized');
  }
}, {
  debugName: 'AppView'
});
module.exports = AppView;
