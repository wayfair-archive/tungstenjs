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
  postInitialize: function() {
    this.listenTo(this, 'addItem', function(title) {
      // @todo add code to clear toggle-all button
      this.get('todoItems').add({title: title});
    });
  },
  derived: {
    incompletedItems: {
      deps: ['todoItems'],
      fn: function() {
        return this.get('todoItems').filter(function(item) {
          return !item.get('completed');
        });
      }
    },
    todoCount: {
      deps: ['incompletedItems'],
      fn: function() {
        return this.get('incompletedItems').length;
      }
    },
    todoCountPlural: {
      deps: ['todoCount'],
      fn: function() {
        return this.get('todoCount') !== 1;
      }
    },
    hasCompleted: {
      deps: ['todoItems'],
      fn: function() {
        return this.get('todoItems').length - this.get('incompletedItems').length > 0;
      }
    }
  }
});
module.exports = AppModel;