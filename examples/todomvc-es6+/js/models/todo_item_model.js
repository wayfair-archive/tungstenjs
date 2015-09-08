/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

import { Model } from 'tungstenjs/adaptors/backbone';
export class TodoItemModel extends Model {
  toggle() {
    this.set({
      completed: !this.get('completed')
    });
  }
}