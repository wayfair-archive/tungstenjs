/**
* Example App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;

var AppView = View.extend({
  events: {
    'click': 'handleClick'
  },
  handleClick: function() {
    console.log('clicked on view');
  }
});
module.exports = AppView;
