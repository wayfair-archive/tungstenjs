/**
 * Todo App Demo for Tungsten.js
 */
'use strict';


import { View } from 'tungstenjs';
import { on, debugName } from '../decorators';

const ENTER_KEY = 13;
const ESC_KEY = 27;
@debugName('TodoItemView')
export class TodoItemView extends View {
  @on('blur .js-todo-edit')
  handleBlurTodoEdit(e) {
    if (!this.model.get('editing')) {
      return;
    }
    this.clear(e.currentTarget);
  }
  @on('click .js-destroy')
  handleClickDestroy() {
    this.model.destroy();
  }
  @on('click .js-toggle')
  handleClickToggle() {
    this.model.set('completed', !this.model.get('completed'));
  }
  @on('dblclick .js-todo-title')
  handleDblClickTodoTitle(e) {
    this.model.set('editing', true);
    this.listenToOnce(this, 'rendered', function() {
      this.el.querySelector('.js-todo-edit').focus();
    });
  }
  @on('keydown .js-todo-edit')
  handleKeyDownTodoEdit(e) {
    if (e.which === ESC_KEY) {
      this.model.set('editing', false);
      this.model.set('title', this.model.get('title'));
    }
  }
  @on('keypress .js-todo-edit')
  handleKeyPressTodoEdit(e) {
    if (e.which === ENTER_KEY) {
      this.clear(e.currentTarget);
    }
  }

  clear(input) {
    let value:string = input.value;
    let trimmedValue = value.trim();

    if (trimmedValue) {
      this.model.set({title: trimmedValue});
      this.model.set('editing', false);
    } else {
      this.handleClickDestroy();
    }
  }
}
