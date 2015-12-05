/**
* App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;
var _ = require('underscore');

var AppView = View.extend({
  events: {
    'click': 'handleClick'
  },
  handleClick: function() {
    console.log('clicked');
  }
}, {
  debugName: 'AppView'
});
module.exports = AppView;
