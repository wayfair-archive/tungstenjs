'use strict';

var Model = require('tungstenjs').Model;
var ItemModel = Model.extend({
  exposedEvents: ['change:completed'],
  toggle: function() {
    this.set({
      completed: !this.get('completed')
    });
  }
}, {
  debugName: 'TodoItemModel'
});
module.exports = ItemModel;
