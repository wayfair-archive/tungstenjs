/**
* Todo App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('../../../../adaptors/backbone-reflux');
var TodoActions = require('../actions');
var todoListStore = require('../store');
var View = TungstenBackboneBase.View;
var NewItemView = require('./todo_new_item_view');
var TodoItemView = require('./todo_item_view');
var _ = require('underscore');

var AppView = View.extend({
  childViews: {
    'js-new-todo': {
      view: NewItemView,
      scope: []
    },
    'js-todo-item': {
      view: TodoItemView,
      scope: ['label', 'isComplete', 'key', 'key:id']
    }
  },
  events: {
    'click .js-toggle-all': 'handleClickToggleAll',
    'click .js-clear-completed': 'handleClickClearCompleted'
  },
  initializeRenderListener: function() {
    var render = _.bind(this.render, this);
    var self = this;
    todoListStore.listen(function() {
      // Since we're attaching a very naive listener, we may get many events in sequence, so we set a small debounce
      clearTimeout(self.debouncer);
      self.debouncer = setTimeout(render, 1);
    });
  },
  handleClickClearCompleted: function() {
    TodoActions.clearCompleted();
    return false;
  },
  handleClickToggleAll: function(e) {
    TodoActions.toggleAllItems(e.currentTarget.checked);
  }
}, {
  debugName: 'TodoAppView'
});

var Cocktail = require('backbone.cocktail');
var Reflux = require('reflux');
module.exports = Cocktail.mixin(AppView, Reflux.connect(todoListStore, 'state'));
