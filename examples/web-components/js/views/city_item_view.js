/**
* Example App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;

var CityItemView = View.extend({
  events: {
    'click' : 'handleClick'
  },
  handleClick: function() {
    this.model.collection.trigger('selectCity', this.model);
  }
});
module.exports = CityItemView;
