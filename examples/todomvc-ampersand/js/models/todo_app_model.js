/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var TungstenAmpersandBase = require('tungstenjs/adaptors/ampersand');

var Model = TungstenAmpersandBase.Model;
var TodoItemCollection = require('../collections/todo_item_collection.js');
var TodoFilterCollection = require('../collections/todo_filter_collection.js');
var AppModel = Model.extend({
  collections: {
    todoItems: TodoItemCollection,
    filters: TodoFilterCollection
  },
  debugName: 'TodoAppModel',
  filter: function(filterBy) {
    this.todoItems.filterItems(filterBy);
    this.filters.selectFilter(filterBy);
  },
  derived: {
    hasTodos: {
      deps: ['todoItems'],
      fn: function() {
        return this.todoItems.length > 0;
      }
    },
    allCompleted: {
      deps: ['todoItems'],
      fn: function() {
        if (this.todoItems.length) {
          return _.every(this.get('todoItems').models, function(item) {
            return item.completed;
          });
        }
      }
    },
    incompletedItems: {
      deps: ['todoItems'],
      fn: function() {
        return this.todoItems.filter(function(item) {
          return !item.completed;
        });
      }
    },
    todoCount: {
      deps: ['todoItems'],
      fn: function() {
        return this.incompletedItems.length;
      }
    },
    todoCountPlural: {
      deps: ['todoCount'],
      fn: function() {
        return this.todoCount !== 1;
      }
    },
    hasCompleted: {
      deps: ['todoItems'],
      fn: function() {
        return this.todoItems.length - this.incompletedItems.length > 0;
      }
    }
  },
  defaults: {
    todoItems: [],
    filters: []
  },
  postInitialize: function() {
    this.listenTo(this.todoItems, 'add remove reset', function() {
      this.todoItems.trigger('change:length');
    });
    this.listenTo(this, 'addItem', function(itemLabel) {
      // @todo add code to clear toggle-all button
      this.todoItems.add({title: itemLabel});
    });
  }
});
module.exports = AppModel;