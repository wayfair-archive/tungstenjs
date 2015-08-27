/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var TungstenAmpersandBase = require('tungstenjs/adaptors/ampersand');

var Model = TungstenAmpersandBase.Model;
var TodoItemCollection = require('../collections/todo_item_collection.js');
var AppModel = Model.extend({
  collections: {
    todoItems: TodoItemCollection
  },
  debugName: 'TodoAppModel',
  derived: {
    completed: {
      deps: ['todoItems'],
      fn: function() {
        return this.todoItems.filter(function(item) {
          return !item.completed;
        });
      }
    },
    todoCount: {
      deps: ['completed'],
      fn: function () {
        return this.completed.length;
      }
    },
    todoCountPlural: {
      deps: ['completed'],
      fn: function () {
        return this.completed.length !== 1;
      }
    },
    completedItems: {
      deps: ['todoItems', 'completed'],
      fn: function () {
        return this.todoItems.length - this.completed.length > 0;
      }
    }
  },
  defaults: {
    todoItems: []
  },
  initialize: function() {
    this.listenTo(this, 'addItem', function(itemLabel) {
      // @todo add code to clear toggle-all button
      this.todoItems.add({title: itemLabel});
    });
  }
});
module.exports = AppModel;