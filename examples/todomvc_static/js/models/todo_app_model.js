/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');

var Model = TungstenBackboneBase.Model;
var TodoItemCollection = require('../collections/todo_item_collection.js');
var AppModel = Model.extend({
  relations: {
    todoItems: TodoItemCollection
  },
  defaults: {
    todoItems: []
  },
  initialize: function() {
    this.setCount();
    this.listenTo(this.get('todoItems'), 'add remove reset change', this.setCount);
    this.listenTo(this, 'addItem', function(title) {
      // @todo add code to clear toggle-all button
      this.get('todoItems').add({title: title});
    });
  },
  setCount: function() {
    var completedItems = this.get('todoItems').filter(function(item) {
      return !item.get('completed');
    });
    // Computed properties
    this.set('todoCount', completedItems.length);
    this.set('todoCountPlural', completedItems.length !== 1);
    this.set('completedItems', this.get('todoItems').length - completedItems.length > 0);
  }
});
module.exports = AppModel;