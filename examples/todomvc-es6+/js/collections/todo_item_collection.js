/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

import { TodoItemModel } from '../models/todo_item_model.js';
import { Collection } from 'tungstenjs';
import { model, debugName } from '../decorators.js';

function itemIsHidden(item, filter) {
  if (filter === 'active') {
    return item.get('completed');
  } else if (filter === 'completed') {
    return !item.get('completed');
  }
  return false;
}

@debugName('TodoItemCollection')
@model(TodoItemModel)
export class TodoItemCollection extends Collection {
  filterItems(filterBy) {
    for (var i = this.length; i--;) {
      var model = this.at(i);
      model.set('hidden', itemIsHidden(model, filterBy));
    }
  }
}
