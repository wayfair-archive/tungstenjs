/**
* Todo App Demo for Tungsten.js
*/
'use strict';


import { View } from 'tungstenjs/adaptors/backbone';
import { on } from '../decorators';

const ENTER_KEY = 13;
export class NewItemView extends View {
  @on('keyup');
  handleKeyup(e) {
    if (e.which === ENTER_KEY && e.currentTarget.value !== '') {
      this.model.trigger('addItem', e.currentTarget.value.trim());
      this.el.value = '';
    }
  }
}
