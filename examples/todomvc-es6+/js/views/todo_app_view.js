/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

import { View } from 'tungstenjs/adaptors/backbone';
import { NewItemView } from './todo_new_item_view';
import { TodoItemView } from './todo_item_view';
import {childViews, on} from '../decorators';
import _ from 'underscore';

@childViews({
  'js-new-todo': NewItemView,
  'js-todo-item': TodoItemView
})
export class AppView extends View {
  postInitialize() {
    this.on('filter', function(filterBy) {
      this.model.filter(filterBy);
    });
  }
@on('click .js-clear-completed')
  handleClickClearCompleted() {
    _.invoke(this.model.get('todoItems').where({completed: true}), 'destroy');
    return false;
  }
  @on('click .js-toggle-all')
  handleClickToggleAll(e) {
    let completed = e.currentTarget.checked;
    this.model.get('todoItems').each(function(item) {
      item.set('completed', completed);
    });
  }
}
