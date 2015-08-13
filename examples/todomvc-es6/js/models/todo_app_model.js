/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

import { Model } from 'tungstenjs/adaptors/backbone';
import { TodoItemCollection } from '../collections/todo_item_collection.js';

export class AppModel extends Model {
  postInitialize() {
    this.listenTo(this, 'addItem', function(title) {
      // @todo add code to clear toggle-all button
      this.get('todoItems').add({title});
    });
  }
}
// Attaching to prototype is a temporary hack,
// pending outcome of https://github.com/jashkenas/backbone/issues/3560
AppModel.prototype.relations = {
  todoItems: TodoItemCollection
};
AppModel.prototype.defaults = {
  todoItems: []
};
AppModel.prototype.derived = {
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
};