/**
* Todo App Demo for Tungsten.js
*/
'use strict';


import { View } from 'tungstenjs/adaptors/backbone';
const ENTER_KEY = 13;
export class NewItemView extends View {
  handleKeyup(e) {
    if (e.which === ENTER_KEY && e.currentTarget.value !== '') {
      this.model.trigger('addItem', e.currentTarget.value);
      this.el.value = '';
    }
  }
}
// Attaching to prototype is a temporary hack,
// pending outcome of https://github.com/jashkenas/backbone/issues/3560
NewItemView.prototype.events = {
  'keyup': 'handleKeyup'
};