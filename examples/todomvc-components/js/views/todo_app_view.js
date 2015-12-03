/**
* Todo App Demo for Tungsten.js
*/
'use strict';

var ENTER_KEY = 13;
var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;
var _ = require('underscore');

var AppView = View.extend({
  events: {
    'keyup .js-new-todo': 'handleKeyup',
    'click .js-toggle-all': 'handleClickToggleAll',
    'click .js-clear-completed': 'handleClickClearCompleted'
  },
  postInitialize: function() {
    var self = this;
    this.listenTo(this, 'filter', function(filterBy) {
      self.model.filter(filterBy);
    });
  },
  handleKeyup: function(e) {
    if (e.which === ENTER_KEY && e.currentTarget.value !== '') {
      this.model.trigger('addItem', e.currentTarget.value.trim());
      e.currentTarget.value = '';
    }
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
