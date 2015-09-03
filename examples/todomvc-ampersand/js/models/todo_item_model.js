/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var Model = require('tungstenjs/adaptors/ampersand').Model;
var ItemModel = Model.extend({
  props: {
    title: 'string',
    completed: {
      'type': 'boolean',
      'default': false
    },
    editing: {
      'type': 'boolean',
      'default': false
    },
    hidden: {
      'type': 'boolean',
      'default': false
    }
  },
  debugName: 'TodoItemModel',
  toggle: function() {
    this.completed = !this.completed;
  }
});
module.exports = ItemModel;