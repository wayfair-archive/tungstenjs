/**
* Example App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var MainView = require('./main_view');
var DrawerView = require('./drawer_view');

var View = TungstenBackboneBase.View;

var AppView = View.extend({
  childViews: {
    'js-main': MainView,
    'js-drawer': DrawerView
  }
});
module.exports = AppView;
