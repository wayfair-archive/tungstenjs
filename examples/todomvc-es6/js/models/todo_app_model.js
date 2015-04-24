/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

import { Model } from 'tungstenjs/adaptors/backbone';
import { TodoItemCollection } from '../collections/todo_item_collection.js';

export class AppModel extends Model {
  initialize() {
    this.setCount();
    this.listenTo(this.get('todoItems'), 'add remove reset change', this.setCount);
    this.listenTo(this, 'addItem', function(title) {
      // @todo add code to clear toggle-all button
      this.get('todoItems').add({title});
    });
  }
  setCount() {
    var completedItems = this.get('todoItems').filter(function(item) {
      return !item.get('completed');
    });
    // Computed properties
    this.set('todoCount', completedItems.length);
    this.set('todoCountPlural', completedItems.length !== 1);
    this.set('completedItems', this.get('todoItems').length - completedItems.length > 0);
  }
}
// Attaching to prototype is a temporary hack,
// pending outcome of https://github.com/jashkenas/backbone/issues/3560
AppModel.prototype.relations = {
  todoItems: TodoItemCollection
};
AppModel.prototype.defaults ={
  todoItems: []
};