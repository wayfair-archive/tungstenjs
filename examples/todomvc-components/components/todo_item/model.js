/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var Model = require('tungstenjs/adaptors/backbone').Model;
var ItemModel = Model.extend({
  exposedEvents: ['change:completed'],
  toggle: function() {
    this.set({
      completed: !this.get('completed')
    });
  }
});
module.exports = ItemModel;
