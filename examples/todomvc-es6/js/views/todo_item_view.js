/**
 * Todo App Demo for Tungsten.js
 */
'use strict';


import { View } from 'tungstenjs/adaptors/backbone';
const ENTER_KEY = 13;
const ESC_KEY = 27;
export class TodoItemView extends View {
  handleBlurTodoEdit(e) {
    if (!this.model.get('editing')) {
      return;
    }
    this.clear(e.currentTarget);
  }

  handleClickDestroy() {
    this.model.destroy();
  }

  handleClickToggle() {
    this.model.toggle();
  }

  handleDblClickTodoTitle(e) {
    this.model.set('editing', true);
    e.currentTarget.focus();
  }

  handleKeyDownTodoEdit(e) {
    if (e.which === ESC_KEY) {
      this.model.set('editing', false);
      this.model.set('title', this.model.get('title'));
    }
  }

  handleKeyPressTodoEdit(e) {
    if (e.which === ENTER_KEY) {
      this.clear(e.currentTarget);
    }
  }

  clear(input) {
    let value = input.value;

    let trimmedValue = value.trim();

    if (trimmedValue) {
      this.model.set({title: trimmedValue});
      input.value = '';
      this.model.set('editing', false);
      if (value !== trimmedValue) {
        this.model.trigger('change');
      }
    } else {
      this.handleClickDestroy();
    }
  }
}
// Attaching to prototype is a temporary hack,
// pending outcome of https://github.com/jashkenas/backbone/issues/3560
TodoItemView.prototype.events = {
  'blur .js-todo-edit': 'handleBlurTodoEdit',
  'click .js-toggle': 'handleClickToggle',
  'click .js-destroy': 'handleClickDestroy',
  'dblclick .js-todo-title': 'handleDblClickTodoTitle',
  'keydown .js-todo-edit': 'handleKeyDownTodoEdit',
  'keypress .js-todo-edit': 'handleKeyPressTodoEdit'
};