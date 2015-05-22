/**
* Todo App Demo for Tungsten.js
*/
'use strict';

var TungstenAmpersandBase = require('tungstenjs/adaptors/ampersand');
var View = TungstenAmpersandBase.View;
var NewItemView = require('./todo_new_item_view');
var TodoItemView = require('./todo_item_view');
var _ = require('underscore');

var AppView = View.extend({
  childViews: {
    'js-new-todo': NewItemView,
    'js-todo-item': TodoItemView
  },
  events: {
    'click .js-toggle-all': 'handleClickToggleAll',
    'click .js-clear-completed': 'handleClickClearCompleted'
  },
  handleClickClearCompleted: function() {
    _.invoke(_.where(this.model.todoItems, {completed: true}), 'destroy');
    return false;
  },
  handleClickToggleAll: function(e) {
    var completed = e.currentTarget.checked;
    this.model.todoItems.each(function(item) {
      item.completed = completed;
    });
  }
}, {
  debugName: 'TodoAppView'
});
module.exports = AppView;
