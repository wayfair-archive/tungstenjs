/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

function itemIsHidden(item, filter) {
  if (filter === 'active') {
    return item.completed;
  } else if (filter === 'completed') {
    return !item.completed;
  }
  return false;
}

var Model = require('../models/todo_item_model.js');
var Collection = require('tungstenjs/adaptors/ampersand').Collection;
var ItemCollection = Collection.extend({
  model: Model,
  filterItems: function(filterBy) {
    for (var i = this.length; i--;) {
      var model = this.at(i);
      model.hidden = itemIsHidden(model, filterBy);
    }
  }
});
module.exports = ItemCollection;