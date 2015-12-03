'use strict';


var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;
var TodoFiltersView = View.extend({
  tagName: 'span'
}, {
  debugName: 'TodoFiltersView'
});
module.exports = TodoFiltersView;
