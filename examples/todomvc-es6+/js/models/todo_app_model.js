/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

import { Model } from 'tungstenjs/adaptors/backbone';
import { TodoItemCollection } from '../collections/todo_item_collection.js';
import { TodoFilterCollection } from '../collections/todo_filter_collection.js';

export class AppModel extends Model {
  postInitialize() {
    this.listenTo(this, 'addItem', function(title) {
      // @todo add code to clear toggle-all button
      this.get('todoItems').add({title});
    });
  }
  filter(filterBy) {
    this.get('todoItems').filterItems(filterBy);
    this.get('filters').selectFilter(filterBy);
  }
}
// Attaching to prototype is a temporary hack,
// pending outcome of https://github.com/jashkenas/backbone/issues/3560
AppModel.prototype.relations = {
  todoItems: TodoItemCollection,
  filters: TodoFilterCollection
};
AppModel.prototype.defaults = {
  todoItems: [],
  filters: []
};
AppModel.prototype.derived = {
  hasTodos: {
    deps: ['todoItems'],
    fn: function() {
      return this.get('todoItems').length > 0;
    }
  },
  incompletedItems: {
    deps: ['todoItems'],
    fn: function() {
      return this.get('todoItems').filter(function(item) {
        return !item.get('completed');
      });
    }
  },
  allCompleted: {
    deps: ['todoItems'],
    fn: function() {
      if (this.get('todoItems').length) {
        return this.get('todoItems').every(function(item) {
          return item.get('completed');
        });
      }
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
};