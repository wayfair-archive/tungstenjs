/**
* Todo App Demo for Tungsten.js
*/
'use strict';


var TungstenBackboneBase = require('../../../../adaptors/backbone-reflux');
var View = TungstenBackboneBase.View;
var TodoActions = require('../actions');
var ENTER_KEY = 13;
var ESC_KEY = 27;
var NewTodoItemView = View.extend({
  events: {
    'keyup': 'handleKeyup'
  },
  handleKeyup: function(evt) {
    var text = evt.target.value;
    if (evt.which === ENTER_KEY && text) { // hit enter, create new item if field isn't empty
      TodoActions.addItem(text);
      evt.target.value = '';
    } else if (evt.which === ESC_KEY) { // hit escape, clear without creating
      evt.target.value = '';
    }
  }
}, {
  debugName: 'NewTodoItemView'
});
module.exports = NewTodoItemView;
