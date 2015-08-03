/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var Model = require('tungstenjs/adaptors/backbone').Model;
var ItemModel = Model.extend({
  toggle: function() {
    this.set({
      completed: !this.get('completed')
    });
  }
}, {
  debugName: 'TodoItemModel'
});
module.exports = ItemModel;