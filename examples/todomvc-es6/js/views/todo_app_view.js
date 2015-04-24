/**
* Todo App Demo for Tungsten.js
*/
'use strict';

import { View } from 'tungstenjs/adaptors/backbone';
import { NewItemView } from './todo_new_item_view';
import { TodoItemView } from './todo_item_view';
import _ from 'underscore';

export class AppView extends View {
  handleClickClearCompleted() {
    _.invoke(this.model.get('todoItems').where({completed: true}), 'destroy');
    return false;
  }
  handleClickToggleAll(e) {
    let completed = e.currentTarget.checked;
    this.model.get('todoItems').each(function(item) {
      item.set('completed', completed);
    });
  }
}
// Attaching to prototype is a temporary hack,
// pending outcome of https://github.com/jashkenas/backbone/issues/3560
AppView.prototype.childViews = {
  'js-new-todo': NewItemView,
    'js-todo-item': TodoItemView
};
AppView.prototype.events = {
  'click .js-toggle-all': 'handleClickToggleAll',
    'click .js-clear-completed': 'handleClickClearCompleted'
};