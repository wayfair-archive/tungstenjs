/**
* Todo App Demo for Tungsten.js
*/
'use strict';


import { View } from 'tungstenjs';
import { on, debugName } from '../decorators';

const ENTER_KEY = 13;
@debugName('TodoNewItemView')
export class NewItemView extends View {
  @on('keyup')
  handleKeyup(e) {
    if (e.which === ENTER_KEY && e.currentTarget.value !== '') {
      this.model.trigger('addItem', e.currentTarget.value.trim());
    } else  {
      this.model.set('newValue', e.currentTarget.value);
    }
  }
}
