/**
* Example App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var CityItemView = require('./city_item_view');
var View = TungstenBackboneBase.View;

var DrawerView = View.extend({
  childViews: {
    'js-city-item': CityItemView
  }
});
module.exports = DrawerView;
