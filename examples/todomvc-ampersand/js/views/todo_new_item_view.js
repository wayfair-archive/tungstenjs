/**
* Todo App Demo for Tungsten.js
*/
'use strict';


var TungstenAmpersandBase = require('tungstenjs/adaptors/ampersand');
var View = TungstenAmpersandBase.View;
var ENTER_KEY = 13;
var NewTodoItemView = View.extend({
  events: {
    'keyup': 'handleKeyup'
  },
  handleKeyup: function(e) {
    if (e.which === ENTER_KEY && e.currentTarget.value !== '') {
      this.model.trigger('addItem', e.currentTarget.value.trim());
    } else  {
      this.model.newValue = e.currentTarget.value;
    }
  }
}, {
  debugName: 'NewTodoItemView'
});
module.exports = NewTodoItemView;
