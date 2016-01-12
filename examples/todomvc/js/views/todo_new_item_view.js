/**
* Todo App Demo for Tungsten.js
*/
'use strict';


var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;
var ENTER_KEY = 13;
var NewTodoItemView = View.extend({
  events: {
    'keyup': 'handleKeyup'
  },
  handleKeyup: function(e) {
    if (e.which === ENTER_KEY && e.currentTarget.value !== '') {
      this.model.trigger('addItem', e.currentTarget.value.trim());
    } else  {
      this.model.set('newValue', e.currentTarget.value);
    }
  }
}, {
  debugName: 'NewTodoItemView'
});
module.exports = NewTodoItemView;
