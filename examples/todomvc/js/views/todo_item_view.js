/**
* Todo App Demo for Tungsten.js
*/
'use strict';


var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;
var ENTER_KEY = 13;
var ESC_KEY = 27;
var TodoItemView = View.extend({
  events: {
    'blur .js-todo-edit': 'handleBlurTodoEdit',
    'click .js-toggle': 'handleClickToggle',
    'click .js-destroy': 'handleClickDestroy',
    'dblclick .js-todo-title': 'handleDblClickTodoTitle',
    'keydown .js-todo-edit': 'handleKeyDownTodoEdit',
    'keypress .js-todo-edit': 'handleKeyPressTodoEdit'
  },
  handleBlurTodoEdit: function(e) {
    if (!this.model.get('editing')) {
      return;
    }
    this.clear(e.currentTarget);
  },
  handleClickDestroy: function() {
    this.model.destroy();
  },
  handleClickToggle: function() {
    this.model.toggle();
  },
  handleDblClickTodoTitle: function(e) {
    this.model.set('editing', true);
    e.currentTarget.focus();
  },
  handleKeyDownTodoEdit: function(e) {
    if (e.which === ESC_KEY) {
      this.model.set('editing', false);
      this.model.set('title', this.model.get('title'));
    }
  },
  handleKeyPressTodoEdit: function(e) {
    if (e.which === ENTER_KEY) {
      this.clear(e.currentTarget);
    }
  },
  clear: function(input) {
    var value = input.value;

    var trimmedValue = value.trim();

    if (trimmedValue) {
      this.model.set({ title: trimmedValue });
      this.model.set('editing', false);
    } else {
      this.handleClickDestroy();
    }
  }
}, {
  debugName: 'TodoItemView'
});
module.exports = TodoItemView;
