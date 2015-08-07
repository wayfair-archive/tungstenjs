/**
* Todo App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;

var NestedView = View.extend({
  events: {
    'doc-click': 'docClick',
    'click': 'click'
  },
  docClick: function() {
    console.log('Component doc click');
  },
  click: function() {
    console.log('Component click');
  },
  delegateEvents: function() {
    console.log('DELEGATED');
    View.prototype.delegateEvents.call(this);
  }
}, {
  debugName: 'NestedView'
});
module.exports = NestedView;
