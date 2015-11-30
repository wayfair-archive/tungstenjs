/**
* Todo App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;
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
  postInitialize: function() {
    this.on('filter', function(filterBy) {
      this.model.filter(filterBy);
    });
  },
  handleClickClearCompleted: function() {
    var todoItems = this.model.get('todoItems');
    var remainingItems = todoItems.filter(function(model) {
      return model.get('completed') !== true;
    });
    todoItems.reset(remainingItems);
    return false;
  },
  handleClickToggleAll: function(e) {
    var completed = e.currentTarget.checked;
    this.model.get('todoItems').each(function(item) {
      item.set('completed', completed);
    });
  }
}, {
  debugName: 'TodoAppView'
});
module.exports = AppView;
